import { useParams } from "react-router-dom";

export const FollowersComponent = () => {
  const { username } = useParams();

  return (
    <div className="text-center font-ubuntu my-5">followers of {username}</div>
  );
};
