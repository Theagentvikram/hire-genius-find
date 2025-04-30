
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Upload, UserCheck, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center text-white py-12 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              ResuMatch: AI-Powered Resume Matching
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Our platform connects recruiters with the perfect candidates and helps applicants 
            track their resume status. Choose your path to get started.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Recruiter Card */}
            <motion.div
              className="relative backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg shadow-blue-500/20">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-blue-300">Recruiters</h2>
              <p className="text-gray-300 mb-6">
                Find the perfect candidates using our AI-powered matching system. Upload job descriptions and get instant matches.
              </p>
              <ul className="space-y-2 mb-6 text-left">
                <li className="flex items-center text-sm">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-2">
                    <UserCheck className="h-3 w-3 text-blue-400" />
                  </div>
                  <span className="text-gray-300">Access to candidate database</span>
                </li>
                <li className="flex items-center text-sm">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-2">
                    <FileText className="h-3 w-3 text-blue-400" />
                  </div>
                  <span className="text-gray-300">AI-powered resume analysis</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90"
                onClick={() => navigate("/recruiter-login")}
              >
                Recruiter Login
              </Button>
            </motion.div>

            {/* Applicant Card */}
            <motion.div
              className="relative backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full shadow-lg shadow-purple-500/20">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-purple-300">Applicants</h2>
              <p className="text-gray-300 mb-6">
                Upload your resume and track its status. Get insights into how you match with job requirements.
              </p>
              <ul className="space-y-2 mb-6 text-left">
                <li className="flex items-center text-sm">
                  <div className="bg-purple-500/20 p-1 rounded-full mr-2">
                    <Upload className="h-3 w-3 text-purple-400" />
                  </div>
                  <span className="text-gray-300">Resume upload and tracking</span>
                </li>
                <li className="flex items-center text-sm">
                  <div className="bg-purple-500/20 p-1 rounded-full mr-2">
                    <Shield className="h-3 w-3 text-purple-400" />
                  </div>
                  <span className="text-gray-300">Secure personal data handling</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90"
                onClick={() => navigate("/user-login")}
              >
                Applicant Login
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
