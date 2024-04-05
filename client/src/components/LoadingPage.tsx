import CircularProgress from "@mui/material/CircularProgress";

export const LoadingPage = () => {
  return (
    <div className="h-screen bg-background flex justify-center items-center">
      <CircularProgress />
    </div>
  );
};
