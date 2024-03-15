export const Quote = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950 ">
      <div className="grid gap-y-10">
        <div className="w-full flex justify-center items-center gap-10">
          <img src="src/assets/poki.gif" className="h-32" />
        </div>
        <div className="px-2">
          <div className=" text-gray-100 text-3xl font-light font-mono ">
            Tired of generic feeds? 🤔
          </div>
          <div className=" text-gray-300 text-xl font-light my-5">
            Join the exclusive social media platform built just for VIT
            students.
          </div>
        </div>
      </div>
    </div>
  );
};
