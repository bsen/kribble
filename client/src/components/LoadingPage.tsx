import CircularProgress from "@mui/material/CircularProgress";

export const LoadingPage = () => {
  return (
    <div className="h-[90vh] bg-background flex justify-center items-center w-full">
      <CircularProgress />
    </div>
  );
};
