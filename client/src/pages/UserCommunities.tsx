import { useParams } from "react-router-dom";

export const UserCommunities = () => {
  const { username } = useParams();
  return <div>{username} communities </div>;
};
