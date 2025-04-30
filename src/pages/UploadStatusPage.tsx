
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UploadStatusPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || userType !== "applicant") {
      navigate("/user-login");
    }
  }, [isAuthenticated, userType, navigate]);

  // Mock resume data
  const resumes = [
    {
      id: 1,
      filename: "my_resume_v1.pdf",
      uploadDate: "2023-05-15",
      status: "reviewed",
      matchScore: 85,
    },
    {
      id: 2,
      filename: "my_resume_updated.pdf",
      uploadDate: "2023-06-20",
      status: "pending",
      matchScore: null,
    },
    {
      id: 3,
      filename: "my_portfolio.pdf",
      uploadDate: "2023-07-05",
      status: "rejected",
      matchScore: 42,
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reviewed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reviewed":
        return "Reviewed";
      case "pending":
        return "Under Review";
      case "rejected":
        return "Not a Match";
      default:
        return "Unknown";
    }
  };

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-center text-white">My Resume Status</h1>
          <p className="text-center text-gray-300 mb-8">
            Track the status of your resume submissions
          </p>
        </motion.div>

        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={() => navigate("/upload")}
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 gap-2"
          >
            <Upload className="h-4 w-4" /> Upload New Resume
          </Button>
        </motion.div>

        <div className="space-y-4">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-400" />
                      <CardTitle className="text-white">{resume.filename}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5">
                      {getStatusIcon(resume.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(resume.status)}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    Uploaded on {resume.uploadDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        {resume.status === "pending" ? (
                          "Your resume is being processed"
                        ) : (
                          <>
                            Match Score: 
                            <span className={`ml-2 font-bold ${
                              (resume.matchScore || 0) > 70 ? "text-green-400" :
                              (resume.matchScore || 0) > 50 ? "text-yellow-400" : "text-red-400"
                            }`}>
                              {resume.matchScore !== null ? `${resume.matchScore}%` : 'N/A'}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs border-white/20 hover:bg-white/10">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UploadStatusPage;
