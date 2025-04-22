
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

// Support root-level health checks
export function GET(req: Request) {
  if (req.url.includes('health')) {
    return new Response('OK', { status: 200 });
  }
  return new Response();
}

export default Index;
