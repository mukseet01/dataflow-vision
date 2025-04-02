
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the landing page
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  // Return the Landing component directly
  return <Landing />;
};

export default Index;
