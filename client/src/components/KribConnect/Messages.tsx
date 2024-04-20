import axios from "axios";
import { useEffect, useState } from "react";

interface User {
  name: string;
  username: string;
  image: string;
}

export const Messages: React.FC<{ otherUser: User }> = (props) => {
  const { username, name, image } = props.otherUser;

  return (
    <div className="h-[90vh] w-full overflow-y-auto no-scrollbar">
      <div className="flex shadow-sm p-2 w-full flex-col justify-center items-center">
        <img
          src={image ? image : "/user.pmg"}
          className="h-20 w-20  rounded-full"
        />
        <div className="text-xl font-semibold text-primarytextcolor">
          {name}
        </div>
        <div className="text-sm text-secondarytextcolor font-light">
          @{username}
        </div>
      </div>
    </div>
  );
};
