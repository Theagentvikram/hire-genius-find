
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Upload, UserCheck, Shield, Clock, BarChart, Users, CheckCircle, ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center text-white py-12 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-blue-400">Craft the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Perfect Resume Match</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Our AI-powered platform helps recruiters find the perfect candidates quickly.
            Describe what you're looking for, and we'll match you with the right candidates.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={() => navigate("/recruiter-login")}
            >
              Recruiter Login
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              onClick={() => navigate("/user-login")}
            >
              Applicant Login
            </Button>
            <Button 
              className="bg-white text-indigo-900 hover:bg-gray-100 px-6"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-indigo-950/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Upload Resumes */}
            <motion.div
              className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Resumes</h3>
              <p className="text-gray-300 text-sm">
                Bulk upload resumes in PDF format. Our system will automatically extract and structure data for easy searching.
              </p>
            </motion.div>

            {/* AI Summarization */}
            <motion.div
              className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-purple-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Summarization</h3>
              <p className="text-gray-300 text-sm">
                Our AI engine automatically summarizes and classifies each resume, identifying key skills and experience.
              </p>
            </motion.div>

            {/* Discover Matches */}
            <motion.div
              className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Discover Matches</h3>
              <p className="text-gray-300 text-sm">
                Discover truly perfect matches for job postings. You'll only find the most relevant candidates instantly.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Instant Optimization & Analytics Dashboard */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Column - Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Instant Optimization</h2>
              <p className="text-gray-300 mb-8">
                Quickly see how well resumes match your requirements and get keyword suggestions to optimize your search.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-full mt-1">
                    <BarChart className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Real-time analytics and resume scoring</h3>
                    <p className="text-gray-400 text-sm">Get insights into how candidates match your requirements</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-full mt-1">
                    <Search className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Filter by design of functionality/features easily</h3>
                    <p className="text-gray-400 text-sm">Narrow down candidates based on specific skills</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-full mt-1">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Open source and transparently developed</h3>
                    <p className="text-gray-400 text-sm">Our platform is built with transparency in mind</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Column - Dashboard Preview */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-indigo-900/70 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Advanced Analytics Dashboard</h3>
                <p className="text-gray-300 text-sm mb-6">Get insights into application pools, set expectations, and optimize your hiring process.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">94%</div>
                    <div className="text-xs text-gray-300">Match Accuracy</div>
                  </div>
                  <div className="bg-indigo-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">30s</div>
                    <div className="text-xs text-gray-300">Processing Time</div>
                  </div>
                  <div className="bg-indigo-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">500+</div>
                    <div className="text-xs text-gray-300">Skills Indexed</div>
                  </div>
                  <div className="bg-indigo-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-1">10x</div>
                    <div className="text-xs text-gray-300">Faster Hiring</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-indigo-950/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-blue-400 mb-2">8.6k+</div>
              <div className="text-sm text-gray-300">Global Users</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-purple-400 mb-2">20k+</div>
              <div className="text-sm text-gray-300">Company Users</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-green-400 mb-2">30+</div>
              <div className="text-sm text-gray-300">Contributors</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-amber-400 mb-2">100%</div>
              <div className="text-sm text-gray-300">Open Source</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Ready to streamline your hiring process?</h2>
            <p className="text-gray-300 mb-8">
              Join hundreds of recruiters who are saving time and finding better candidates with ResumeMatch.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => navigate("/signup")}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
