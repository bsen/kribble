import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { HomeComponent } from "../components/HomeComponent";
import { Suggetions } from "../components/Suggetions";
import { useState } from "react";
export const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between bg-black">
      <Sidebar />
      <div className="h-screen w-[80%] border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
        <HomeComponent />
      </div>
      <Suggetions />
    </div>
  );
};
