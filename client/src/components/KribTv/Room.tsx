import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = ({
  localAudioTrack,
  localVideoTrack,
}: {
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [lobby, setLobby] = useState(true);
  const sendingPc = useRef<null | RTCPeerConnection>(null);
  const receivingPc = useRef<null | RTCPeerConnection>(null);
  const remoteVideoTrack = useRef<MediaStreamTrack | null>(null);
  const remoteAudioTrack = useRef<MediaStreamTrack | null>(null);
  const remoteMediaStream = useRef<MediaStream | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const socket = io(URL);

    socket.on("send-offer", async ({ roomId }) => {
      console.log("sending offer");
      setLobby(false);
      const pc = new RTCPeerConnection();

      sendingPc.current = pc;
      if (localVideoTrack) {
        console.error("added tack");
        console.log(localVideoTrack);
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        console.error("added tack");
        console.log(localAudioTrack);
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("on negotiation neeeded, sending offer");
        const sdp = await pc.createOffer();
        //@ts-ignore
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer");
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      //@ts-ignore
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      remoteMediaStream.current = stream;
      // trickle ice
      receivingPc.current = pc;
      //@ts-ignore
      window.pcr = pc;
      pc.ontrack = (e) => {
        console.log(e.track);
        alert("ontrack");
      };

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("omn ice candidate on receiving seide");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        console.log(track1);
        if (track1.kind === "video") {
          remoteAudioTrack.current = track2;
          remoteVideoTrack.current = track1;
        } else {
          remoteAudioTrack.current = track1;
          remoteVideoTrack.current = track2;
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
      }, 5000);
    });

    socket.on("answer", ({ sdp: remoteSdp }) => {
      setLobby(false);
      sendingPc.current?.setRemoteDescription(remoteSdp);
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type });
      if (type == "sender") {
        receivingPc.current?.addIceCandidate(candidate);
      } else {
        sendingPc.current?.addIceCandidate(candidate);
      }
    });
  }, []);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  return (
    <div>
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      <div> {lobby ? "Waiting to connect you to someone" : ""}</div>
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};
