
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { toast } from "sonner";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (data: { 
    name?: string; 
    email: string; 
    password: string 
  }) => {
    setIsLoading(true);
    
    // Simulate registration request
    setTimeout(() => {
      setIsLoading(false);
      
      // Successful registration simulation
      toast.success("Account created successfully!");
      navigate("/dashboard");
      
      // Error handling would be here in a real app
      // toast.error("Email already in use. Please use a different email.");
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
        <p className="text-muted-foreground">Create your account to get started</p>
      </div>
      
      <AuthForm 
        type="register" 
        onSubmit={handleRegister} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default Register;
