
import { createContext, useState, useContext, ReactNode } from "react";
import { Resume, SearchResult } from "@/types";
import { mockResumes, searchResumes } from "@/lib/mockData";
import { useToast } from "@/components/ui/use-toast";

interface ResumeContextType {
  resumes: Resume[];
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  deleteResume: (id: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchQuery: string;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>(mockResumes);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const addResume = (resume: Resume) => {
    setResumes((prev) => [...prev, resume]);
    toast({
      title: "Resume added",
      description: `${resume.originalName} has been added to your collection.`,
    });
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
    toast({
      title: "Resume deleted",
      description: "The resume has been removed from your collection.",
    });
  };

  const search = async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    try {
      const results = await searchResumes(query);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No matches found",
          description: "Try a different search query or upload more resumes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "There was an error processing your search.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const value = {
    resumes,
    setResumes,
    addResume,
    deleteResume,
    searchResults,
    isSearching,
    searchQuery,
    search,
    clearSearch,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumes() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumes must be used within a ResumeProvider");
  }
  return context;
}
