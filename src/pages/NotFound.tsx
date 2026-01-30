import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// Hyper Softs (Hypersofts) - 404 Page by Hyper Developer (Hyperdeveloper)
// Best Same Trend API for Wingo, K3, 5D, TRX games in India
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // Hyper Softs 404 tracking - Hypersofts by Hyper Developer
    document.title = "404 - Page Not Found | Hyper Softs (Hypersofts) - Same Trend API by Hyper Developer";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center max-w-md px-4">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-4 text-muted-foreground">
          Oops! The page you're looking for doesn't exist on Hyper Softs (Hypersofts). 
          Return to Hyper Developer Same Trend API dashboard for Wingo, K3, 5D, TRX predictions.
        </p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          ← Return to Hyper Softs Home
        </a>
        <p className="mt-6 text-xs text-muted-foreground">
          Hyper Softs (Hypersofts) - India's Best Same Trend API by Hyper Developer (Hyperdeveloper)
        </p>
      </div>
    </div>
  );
};

export default NotFound;
