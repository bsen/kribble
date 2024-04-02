import { ButtonsSidebar } from "./ButtonsSidebar";
export const Sidebar = () => {
  return (
    <>
      <div className="h-screen bg-black border-r  border-bordercolor flex flex-col justify-between items-center">
        <div className="w-full flex flex-col items-center">
          <div className="text-[2rem] text-white font-ubuntu flex w-[80%] justify-center items-center border-b border-bordercolor pb-2">
            kribble
          </div>

          <ButtonsSidebar />
        </div>
      </div>
    </>
  );
};
