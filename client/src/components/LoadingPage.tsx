import CircularProgress from "@mui/material/CircularProgress";

export const LoadingPage = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};
