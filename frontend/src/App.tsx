import { useState } from "react";
const App = () => {
  const [count, setCount] = useState("");
  return (
    <>
      <div className="h-screen bg-white">
        <div className="w-full px-10 py-2 bg-white flex justify-between items-center border-b border-gray-300">
          <div className="text-black text-2xl">undate</div>
          <div>
            <input
              placeholder="search for friends"
              className="w-[40vw] h-10 px-4 bg-gray-50 border border-gray-300 rounded-full"
            />
          </div>
          <div className="h-8 w-8 bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default App;
