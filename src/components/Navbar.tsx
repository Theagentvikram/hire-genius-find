
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-brand-blue" />
        <Link to="/" className="text-xl font-semibold text-brand-blue">
          ResuMatch
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <div className="text-sm text-gray-600">
              Logged in as <span className="font-medium">{user?.username}</span>
            </div>
            
            {user?.role === "admin" && (
              <Link to="/upload">
                <Button variant="outline" size="sm">
                  Upload Resumes
                </Button>
              </Link>
            )}
            
            <Link to="/search">
              <Button variant="outline" size="sm">
                Search Resumes
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
