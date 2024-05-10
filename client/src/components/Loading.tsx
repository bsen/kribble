import CircularProgress from "@mui/material/CircularProgress";

export const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center w-full">
      <CircularProgress color="inherit" />
    </div>
  );
};
