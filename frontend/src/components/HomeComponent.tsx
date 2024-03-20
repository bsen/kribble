import axios from "axios";
import { BACKEND_URL } from "../config";
import { useEffect } from "react";

export const HomeComponent = () => {
  const token = localStorage.getItem("token");

  async function getAllPosts() {
    console.log(token);
    const res = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/bulkposts`,
      { token }
    );
    console.log(res.data.message);
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  return <div className="h-screen">hey tehre</div>;
};
