import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      setIsVisible(
        (prevScrollPos > currentScrollPos &&
          prevScrollPos - currentScrollPos > 70) ||
          currentScrollPos < 10
      );

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return isVisible ? (
    <div className="top-0 rounded-b-md h-12 shadow-sm bg-white fixed w-full lg:w-[50%]">
      <div className="w-full h-full flex justify-center items-center">
        <div
          onClick={() => {
            navigate("/home");
          }}
        >
          <img src="/logo.png" className="h-8" />
        </div>
      </div>
    </div>
  ) : null;
};
