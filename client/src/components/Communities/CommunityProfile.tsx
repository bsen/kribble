import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const CommunityProfile = () => {
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const [communityData, setCommunityData] = useState<{
    name: string;
    image: string;
    membersCount: number;
  }>({ name: "", image: "", membersCount: 0 });
  const getCommunity = async () => {
    const response = await axios.post("http://localhost:5878", { token, name });
  };
  return (
    <>
      <div> this is the community page of {name}</div>
    </>
  );
};
