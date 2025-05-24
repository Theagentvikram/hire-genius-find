
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumes } from "@/contexts/ResumeContext";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { searchResumes } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { search, setSearchResults } = useResumes();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      search(query);
    }
  };

  const placeholderQueries = [
    "Python developer with 2+ years experience",
    "Frontend engineer with React skills",
    "Data scientist with machine learning background",
    "Software engineer with JavaScript experience"
  ];

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    setIsSearching(true);
    search(sampleQuery);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Describe the candidate you're looking for..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching || !query.trim()}>
            {isSearching ? (
              "Searching..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" /> Search
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Try sample queries:</p>
          <div className="flex flex-wrap gap-2">
            {placeholderQueries.map((sampleQuery) => (
              <Button
                key={sampleQuery}
                variant="outline"
                size="sm"
                onClick={() => handleSampleQuery(sampleQuery)}
                className="text-xs"
              >
                {sampleQuery}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
