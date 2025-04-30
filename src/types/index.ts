
export interface User {
  id: string;
  username: string;
  password: string; // Note: In a real app, we'd never store passwords in plain text
  role: 'admin' | 'recruiter';
}

export interface Resume {
  id: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  summary: string;
  category: string;
  skills: string[];
  experience: number;
  educationLevel: string;
  fileUrl: string;
}

export interface SearchResult {
  resume: Resume;
  matchScore: number;
  matchReason?: string;
}
