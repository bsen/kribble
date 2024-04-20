import { Buttons } from "./Buttons";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen border-r border-neutral-200 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          <Buttons />
        </div>

        <div className="text-sm text-center py-2 font-ubuntu font-normal text-secondarytextcolor">
          © 2024 kribble Ltd
        </div>
      </div>
    </>
  );
};
