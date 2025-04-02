
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { toast } from "sonner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    
    // Simulate login request
    setTimeout(() => {
      setIsLoading(false);
      
      // Successful login simulation
      toast.success("Login successful!");
      navigate("/dashboard");
      
      // Error handling would be here in a real app
      // toast.error("Invalid credentials. Please try again.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/40 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-2xl">
            DS
          </div>
        </div>
        <h1 className="text-3xl font-bold">DataSplend</h1>
        <p className="text-muted-foreground">AI-powered data entry and analysis</p>
      </div>
      
      <AuthForm 
        type="login" 
        onSubmit={handleLogin} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default Login;
