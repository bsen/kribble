import { useParams } from "react-router-dom";

export const FollowingComponent = () => {
  const { username } = useParams();
  return <div>following of {username}</div>;
};
