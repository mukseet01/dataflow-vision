
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the landing page
  useEffect(() => {
    // Don't redirect if this is a health check
    if (window.location.pathname === "/" && window.location.search.includes("health")) {
      return;
    }
    navigate("/", { replace: true });
  }, [navigate]);

  // For health checks, render a simple div
  if (window.location.search.includes("health")) {
    return <div id="health-check">OK</div>;
  }

  // Return the Landing component directly
  return <Landing />;
};

export default Index;
