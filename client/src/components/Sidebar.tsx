import { ButtonsSidebar } from "./ButtonsSidebar";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen bg-black border-r  border-neutral-800 flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          <div className="text-[2rem] text-white font-ubuntu flex w-[80%] justify-center items-center border-b border-neutral-800 pb-2">
            kribble
          </div>
        </div>
        <ButtonsSidebar />
        <div></div>
      </div>
    </>
  );
};
