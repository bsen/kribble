import React from "react";
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
    <CreatePostComponent
      isCommunityPost={isCommunityPost}
      communityName={isCommunityPost ? name : undefined}
    />
  );
};
