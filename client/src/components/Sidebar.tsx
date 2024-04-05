import { ButtonsSidebar } from "./ButtonsSidebar";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen border-r border-neutral-200 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="text-[2rem] text-primarytextcolor font-ubuntu flex w-[80%] justify-center items-center border-b border-neutral-200  pb-2">
            kribble
          </div>
          <ButtonsSidebar />
        </div>

        <div className="text-sm text-center py-2 font-ubuntu font-normal text-secondarytextcolor">
          © 2024 kribble Ltd
        </div>
      </div>
    </>
  );
};
