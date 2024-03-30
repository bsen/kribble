import React from "react";

import { KribbleTvPage } from "../components/KribbleTvPage";
import { QuoteKribbleTv } from "../components/QuoteKribbleTv";
export const KribbleTv = () => {
  return (
    <div className="md:flex justify-center">
      <QuoteKribbleTv />

      <KribbleTvPage />
    </div>
  );
};
