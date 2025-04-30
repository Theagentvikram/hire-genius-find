
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResumes } from "@/contexts/ResumeContext";
import { saveResume } from "@/lib/mockData";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addResume } = useResumes();
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // In a real app, this would use an LLM to generate a summary
      // For demo, we'll generate a mock summary
      const skills = ["JavaScript", "Python", "React", "Node.js", "Data Analysis"];
      const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
      setSummary(`Recent graduate with experience in ${randomSkills.join(", ")}. Passionate about technology and eager to learn new skills.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF resume to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a job category for this resume.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      const resume = await saveResume(file, summary, category);
      addResume(resume);
      
      // Set to 100% when complete
      setProgress(100);
      
      setFile(null);
      setSummary("");
      setCategory("");
      
      toast({
        title: "Upload successful",
        description: "Resume has been successfully processed and added to the database.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your upload.",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Resume</CardTitle>
        <CardDescription>
          Upload a PDF resume to be processed by our AI system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume-file">Resume File (PDF)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-10 w-10 text-brand-blue mx-auto" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Change file
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">
                    Drag and drop your resume here, or{" "}
                    <label htmlFor="resume-file" className="text-brand-blue cursor-pointer hover:underline">
                      browse
                    </label>
                  </p>
                  <Input
                    id="resume-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Job Category</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select job category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                <SelectItem value="Web Developer">Web Developer</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                <SelectItem value="AI Engineer">AI Engineer</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="UX Designer">UX Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {file && (
            <div className="space-y-2">
              <Label htmlFor="summary">AI Generated Summary</Label>
              <Textarea
                id="summary"
                placeholder="Resume summary will appear here after processing..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This summary would normally be generated by an AI. You can edit it if needed.
              </p>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 100
                  ? "Processing resume..."
                  : "Upload complete!"}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!file || !category || isUploading}
          >
            {isUploading ? "Processing..." : "Upload Resume"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Supports PDF files up to 5MB. Resumes will be automatically analyzed and categorized.
        </p>
      </CardFooter>
    </Card>
  );
}
