
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  userType: "recruiter" | "applicant" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"recruiter" | "applicant" | null>(null);

  // Check localStorage for user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedUserType && (storedUserType === "recruiter" || storedUserType === "applicant")) {
      setUserType(storedUserType as "recruiter" | "applicant");
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Set user type based on role
    const type = user.role === "admin" ? "recruiter" : "applicant";
    setUserType(type);
    localStorage.setItem("userType", type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    userType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
