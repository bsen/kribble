import { useParams } from "react-router-dom";

export const FollowersComponent = () => {
  const { username } = useParams();
  return <div>followers of {username}</div>;
};
