
import { Layout } from "@/components/Layout";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/search");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="py-12">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
