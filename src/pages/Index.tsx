// Hyper Softs (Hypersofts) - India's Best Same Trend API by Hyper Developer (Hyperdeveloper)
// Wingo API, K3 API, 5D API, TRX API, Numeric API - Best prediction trends

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to landing page - Hyper Softs Same Trend API
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Welcome to Hyper Softs (Hypersofts)
        </h1>
        <p className="text-xl text-muted-foreground mb-4">
          India's #1 Same Trend API by Hyper Developer (Hyperdeveloper)
        </p>
        <p className="text-muted-foreground">
          Best prediction API for Wingo, K3, 5D, TRX games. Professional same trend data with real-time updates.
        </p>
      </div>
    </div>
  );
};

export default Index;
