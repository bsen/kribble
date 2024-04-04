import { ButtonsSidebar } from "./ButtonsSidebar";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen bg-black border-r  border-neutral-800 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="text-[2rem] text-white font-ubuntu flex w-[80%] justify-center items-center border-b border-neutral-800 pb-2">
            kribble
          </div>
          <ButtonsSidebar />
        </div>

        <div className="text-sm text-center py-2 font-ubuntu font-normal text-neutral-600">
          © 2024 kribble Ltd
        </div>
      </div>
    </>
  );
};
