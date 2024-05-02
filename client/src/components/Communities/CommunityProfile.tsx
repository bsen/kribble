import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import { SearchBox } from "../HomeComponents/SearchBar";
import AddIcon from "@mui/icons-material/Add";

interface CommunityData {
  name: string;
  description: string;
  category: string;
  image: string;
  membersCount: string;
  postsCount: string;
}

export const CommunityProfile: React.FC = () => {
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData>({
    name: "",
    description: "",
    category: "",
    image: "",
    membersCount: "",
    postsCount: "",
  });

  const getCommunityData = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/community/community-data`,
        { token, name }
      );
      setCommunityData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCommunityData();
  }, []);

  return (
    <div className="h-screen overflow-y-auto no-scrollbar py-14">
      <SearchBox />
      <div className="w-full p-4 flex flex-col items-start border-b border-neutral-200">
        <div className="flex justify-between w-full items-start">
          <img
            src={communityData.image || "/group.png"}
            alt={communityData.name}
            className="w-24 rounded-full border border-neutral-50 mb-2"
          />
          <div className="flex my-2 gap-4 justify-between items-center">
            <button className="bg-neutral-800 text-background px-4 py-1 text-sm rounded-full font-ubuntu">
              <div>{isFollowing ? <div>Unfollow</div> : <div>Follow</div>}</div>
            </button>
          </div>
        </div>
        <div className="text-2xl text-primarytextcolor font-medium">
          {communityData.name}
        </div>
        <div className="text-primarytextcolor text-base font-ubuntu">
          {communityData.category}
        </div>
        <div className="text-primarytextcolor  text-sm font-light">
          {communityData.description
            ? communityData.description
            : "description"}
        </div>
        <button
          onClick={() => {
            navigate("/create/post");
          }}
        >
          <div
            className={
              "flex justify-between text-sm my-2 items-center text-secondarytextcolor bg-neutral-100 px-4 py-1 rounded-full"
            }
          >
            <AddIcon sx={{ fontSize: 20 }} />
            <p>Post</p>
          </div>
        </button>
        <div className="flex justify-evenly gap-5 items-center text-sm text-primarytextcolor font-ubuntu">
          <div className="text-sm font-ubuntu font-semibold text-secondarytextcolor bg-neutral-100 px-4 py-1 rounded-full">
            Members: {communityData.membersCount}
          </div>
          <div className="text-sm font-ubuntu font-semibold text-secondarytextcolor bg-neutral-100 px-4 py-1 rounded-full">
            Posts: {communityData.postsCount}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};
