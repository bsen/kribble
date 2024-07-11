import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress, Box, Button, Modal } from "@mui/material";

interface FollowersData {
  id: string;
  follower: Follower;
}

interface Follower {
  id: string;
  username: string;
  image: string;
}

interface FollowersComponentProps {
  closeComponent: () => void;
}

export const FollowersComponent: React.FC<FollowersComponentProps> = ({
  closeComponent,
}) => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [followersData, setFollowersData] = useState<{
    followers: FollowersData[];
    nextCursor: string | null;
  }>({
    followers: [],
    nextCursor: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(true);

  async function getFollowers(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/follow/followers/list`,
        { token, cursor, username }
      );
      setFollowersData({
        followers: [...followersData.followers, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFollowers();
  }, []);

  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop +
        scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight &&
      followersData.nextCursor &&
      !isLoading
    ) {
      getFollowers(followersData.nextCursor);
    }
  };

  const handleClose = () => {
    setIsFollowersModalOpen(false);
    closeComponent();
  };

  return (
    <Modal
      open={isFollowersModalOpen}
      onClose={handleClose}
      aria-labelledby="followers-modal"
      aria-describedby="followers-list"
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
          <Box sx={{ fontWeight: "bold" }}>Followers</Box>
          <Box sx={{ width: 24 }} />
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
          {followersData.followers.length > 0 ? (
            followersData.followers.map((followersObj) => (
              <Box
                key={followersObj.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderBottom: "1px solid #363636",
                }}
              >
                <img
                  src={
                    followersObj.follower.image
                      ? followersObj.follower.image
                      : "/user.png"
                  }
                  alt={followersObj.follower.username}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    marginRight: 12,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Link
                    to={`/${followersObj.follower.username}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Box>{followersObj.follower.username}</Box>
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
                  No followers found
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};
