import { API_ENDPOINTS } from "@/config/api";

/**
 * Upload a resume file to the backend
 */
export const uploadResume = async (file: File, category: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Fetch all resumes from the backend
 */
export const fetchAllResumes = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.UPLOAD}/all`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

/**
 * Search for resumes based on a query
 */
export const searchResumes = async (query: string): Promise<any> => {
  try {
    const response = await fetch(API_ENDPOINTS.SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching resumes:', error);
    throw error;
  }
};
