import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress, Box, Button, Modal } from "@mui/material";

interface FollowingsData {
  id: string;
  following: Following;
}

interface Following {
  id: string;
  username: string;
  image: string;
}

interface FollowingComponentProps {
  closeComponent: () => void;
}

export const FollowingComponent: React.FC<FollowingComponentProps> = ({
  closeComponent,
}) => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [followingsData, setFollowingsData] = useState<{
    followings: FollowingsData[];
    nextCursor: string | null;
  }>({
    followings: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(true);

  async function getFollowings(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/follow/following/list`,
        { token, cursor, username }
      );
      setFollowingsData({
        followings: [...followingsData.followings, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFollowings();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      followingsData.nextCursor &&
      !isLoading
    ) {
      getFollowings(followingsData.nextCursor);
    }
  };

  const handleClose = () => {
    setIsFollowingModalOpen(false);
    closeComponent();
  };

  return (
    <Modal
      open={isFollowingModalOpen}
      onClose={handleClose}
      aria-labelledby="following-modal"
      aria-describedby="following-list"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "#262626",
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          color: "white",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #363636",
            p: 2,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{ color: "white", minWidth: "auto" }}
          >
            <ArrowBackIcon />
          </Button>
          <Box sx={{ fontWeight: "bold" }}>Following</Box>
          <Box sx={{ width: 24 }} /> {/* Spacer for centering */}
        </Box>
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            overflowY: "auto",
            flex: 1,
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {followingsData.followings.length > 0 ? (
            followingsData.followings.map((followingObj) => (
              <Box
                key={followingObj.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderBottom: "1px solid #363636",
                }}
              >
                <img
                  src={
                    followingObj.following.image
                      ? followingObj.following.image
                      : "/user.png"
                  }
                  alt={followingObj.following.username}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    marginRight: 12,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Link
                    to={`/${followingObj.following.username}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Box>{followingObj.following.username}</Box>
                  </Link>
                </Box>
              </Box>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              {isLoading ? (
                <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
              ) : (
                <Box sx={{ color: "#a8a8a8", fontSize: 14 }}>
                  No following found
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};
