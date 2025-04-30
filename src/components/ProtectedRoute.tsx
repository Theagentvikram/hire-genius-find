
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "recruiter";
  requiredUserType?: "recruiter" | "applicant";
}

export function ProtectedRoute({ children, requiredRole, requiredUserType }: ProtectedRouteProps) {
  const { isAuthenticated, user, userType } = useAuth();

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on required user type
    if (requiredUserType === "recruiter") {
      return <Navigate to="/recruiter-login" replace />;
    } else if (requiredUserType === "applicant") {
      return <Navigate to="/user-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Check role if required
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/search" replace />;
  }

  // Check user type if required
  if (requiredUserType && userType !== requiredUserType) {
    if (userType === "recruiter") {
      return <Navigate to="/search" replace />;
    } else {
      return <Navigate to="/upload-status" replace />;
    }
  }

  return <>{children}</>;
}
