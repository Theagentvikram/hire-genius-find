
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Search, Upload, UserCheck } from "lucide-react";

export function Landing() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="py-12 md:py-24 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-brand-blue">
          Smart Resume Matching for Recruiters
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Find the perfect candidates with ease using our AI-powered resume matching platform. Simply describe what you're looking for, and we'll find the best matches.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              <Search className="h-4 w-4" /> Try Resume Search
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="lg" variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Upload Resumes
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Upload className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Upload Resumes</h3>
              <p className="text-gray-600 text-center">
                Bulk upload student resumes in PDF format. Our system will automatically organize and store them securely.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FileText className="h-6 w-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">AI Summarization</h3>
              <p className="text-gray-600 text-center">
                Our AI engine automatically summarizes and classifies each resume, extracting key skills and experiences.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Smart Matching</h3>
              <p className="text-gray-600 text-center">
                Describe what you're looking for in plain language, and we'll find the most relevant candidates instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to streamline your hiring process?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join hundreds of recruiters who are saving time and finding better candidates with ResuMatch.
        </p>
        <Link to="/login">
          <Button size="lg" className="px-8">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
