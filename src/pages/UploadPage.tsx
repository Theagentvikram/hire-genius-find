
import { Layout } from "@/components/Layout";
import { UploadForm } from "@/components/UploadForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user && user.role !== "admin") {
      navigate("/search");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Upload Resumes</h1>
        <UploadForm />
      </div>
    </Layout>
  );
};

export default UploadPage;
