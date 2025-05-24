/**
 * API Configuration for Resume Matching App
 */

// Backend API URL
// IMPORTANT: Update this URL with the ngrok URL from your Colab notebook output
// It should look like: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app
// The URL is printed when you run the backend in Colab with the message:
// Update this URL each time the Colab notebook is restarted
export const API_URL = 'http://localhost:8005';

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD: `${API_URL}/upload`,
  SEARCH: `${API_URL}/search`,
};

// Helper function to check if the API is available
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
};
