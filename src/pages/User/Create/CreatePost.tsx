import React from "react";
import { SideBar } from "../../../components/Bars/SideBar";
import { CreatePostComponent } from "../../../components/User/Create/Post";
import { useParams } from "react-router-dom";

interface CreatePostProps {
  isCommunityPost?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  isCommunityPost = false,
}) => {
  const { name } = useParams<{ name?: string }>();

  return (
    <div className="flex justify-evenly">
      <div className="w-[16%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[34%]">
        <CreatePostComponent
          isCommunityPost={isCommunityPost}
          communityName={isCommunityPost ? name : undefined}
        />
      </div>
      <div className="w-[16%] max-lg:hidden"></div>
    </div>
  );
};
