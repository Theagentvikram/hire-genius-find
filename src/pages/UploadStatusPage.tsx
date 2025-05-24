
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumes } from "@/contexts/ResumeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UploadStatusPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const { resumes, setResumes } = useResumes();
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || userType !== "applicant") {
      navigate("/user-login");
    }
  }, [isAuthenticated, userType, navigate]);

  // Function to fetch the latest resume data
  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const { fetchAllResumes } = await import('@/services/api');
      const data = await fetchAllResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resume data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resume data on component mount and periodically
  useEffect(() => {
    // Fetch immediately on mount
    fetchResumeData();
    
    // Set up interval to refresh data every 5 seconds
    const intervalId = setInterval(() => {
      fetchResumeData();
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Helper function to determine if a resume has been processed
  const getResumeStatus = (resume: any) => {
    // If the resume has a summary and it's not empty, it's been processed
    if (resume.summary && resume.summary.trim() !== "") {
      return "processed";
    }
    
    // Check if the resume was uploaded more than 30 seconds ago
    const uploadTime = new Date(resume.uploadDate).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - uploadTime;
    
    // If more than 30 seconds have passed since upload, consider it processed
    if (timeDifference > 30000) {
      return "processed";
    }
    
    return "pending";
  };

  const getStatusIcon = (resume: any) => {
    const status = getResumeStatus(resume);
    switch (status) {
      case "processed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (resume: any) => {
    const status = getResumeStatus(resume);
    switch (status) {
      case "processed":
        return "Processed";
      case "pending":
        return "Processing";
      default:
        return "Unknown";
    }
  };

  const openResumeDetails = (resume: any) => {
    setSelectedResume(resume);
    setDialogOpen(true);
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
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => navigate("/upload")}
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 gap-2"
            >
              <Upload className="h-4 w-4" /> Upload New Resume
            </Button>
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                <span>Refreshing resume data...</span>
              </div>
            )}
          </div>
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
                      <CardTitle className="text-white">{resume.originalName || resume.filename}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5">
                      {getStatusIcon(resume)}
                      <span className="text-sm font-medium">
                        {getStatusText(resume)}
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
                        {getResumeStatus(resume) === "pending" ? (
                          "Your resume is being processed"
                        ) : (
                          <>
                            Category: <span className="ml-2 font-bold text-purple-400">{resume.category}</span>
                          </>
                        )}
                      </p>
                      {resume.summary && (
                        <p className="text-sm text-gray-300 mt-2">
                          <span className="font-bold">Summary:</span> {resume.summary.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-white/20 hover:bg-white/10"
                      onClick={() => openResumeDetails(resume)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Resume Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-900 border border-white/10 text-white max-w-2xl">
            {selectedResume && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    {selectedResume.originalName || selectedResume.filename}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Uploaded on {new Date(selectedResume.uploadDate).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 w-fit">
                    {getStatusIcon(selectedResume)}
                    <span className="text-sm font-medium">
                      {getStatusText(selectedResume)}
                    </span>
                  </div>
                  
                  {/* Summary */}
                  {selectedResume.summary && (
                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Summary</h3>
                      <p className="text-gray-300">{selectedResume.summary}</p>
                    </div>
                  )}
                  
                  {/* Skills */}
                  {selectedResume.skills && selectedResume.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.skills.map((skill: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Experience & Education */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Experience</h3>
                      <p className="text-2xl font-bold text-white">
                        {selectedResume.experienceYears} <span className="text-sm text-gray-400">years</span>
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Education</h3>
                      <p className="text-xl font-bold text-white">{selectedResume.educationLevel}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UploadStatusPage;
