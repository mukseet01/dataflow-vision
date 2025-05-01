
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  // Check if this is a health check request
  const isHealthCheck = window.location.pathname === "/health" || 
                         window.location.pathname === "/health.html" ||
                         window.location.search.includes("health");

  // Only redirect if not a health check
  useEffect(() => {
    if (!isHealthCheck && window.location.pathname === "/") {
      navigate("/", { replace: true });
    }
  }, [navigate, isHealthCheck]);

  // For health checks, render a simple div
  if (isHealthCheck) {
    return <div id="health-check">OK</div>;
  }

  // Return the Landing component directly
  return <Landing />;
};

export default Index;
