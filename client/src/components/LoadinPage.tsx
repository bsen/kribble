import CircularProgress from "@mui/material/CircularProgress";

export const LoadinPage = () => {
  return (
    <div className="h-screen w-full absolute bg-black/70 flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};
