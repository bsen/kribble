import { useParams } from "react-router-dom";

export const FollowingComponent = () => {
  const { username } = useParams();
  return (
    <div className="text-center font-ubuntu my-5">following of {username}</div>
  );
};
