
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Search, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, logout, isAuthenticated, userType } = useAuth();

  return (
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-400" />
        <Link to="/" className="text-xl font-semibold text-white">
          ResuMatch
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <div className="text-sm text-gray-300">
              Logged in as <span className="font-medium text-white">{user?.username}</span>
              {userType && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 py-0.5 px-2 rounded-full">
                  {userType === "recruiter" ? "Recruiter" : "Applicant"}
                </span>
              )}
            </div>
            
            {userType === "recruiter" && (
              <>
                <Link to="/search">
                  <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white gap-1">
                    <Search className="h-4 w-4" /> Search Resumes
                  </Button>
                </Link>
                
                {user?.role === "admin" && (
                  <Link to="/upload">
                    <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white gap-1">
                      <Upload className="h-4 w-4" /> Upload Resumes
                    </Button>
                  </Link>
                )}
              </>
            )}
            
            {userType === "applicant" && (
              <>
                <Link to="/upload">
                  <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white gap-1">
                    <Upload className="h-4 w-4" /> Upload Resume
                  </Button>
                </Link>
                
                <Link to="/upload-status">
                  <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white gap-1">
                    <FileText className="h-4 w-4" /> View Status
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/recruiter-login">
              <Button variant="outline" size="sm" className="border-blue-400/30 text-blue-400 hover:bg-blue-900/30">
                Recruiter Login
              </Button>
            </Link>
            <Link to="/user-login">
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 text-white">
                Applicant Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
