
import { Layout } from "@/components/Layout";
import { SearchForm } from "@/components/SearchForm";
import { ResumeResults } from "@/components/ResumeResults";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Resume Search</h1>
        <p className="text-center text-gray-500 mb-8">
          Use natural language to describe the candidate you're looking for
        </p>
        
        <div className="max-w-4xl mx-auto">
          <SearchForm />
          <ResumeResults />
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
