// services/authService.ts
import axios from 'axios';

// API URLs - Use the development URLs when running locally
const AUTH_SERVICE_URL =  "https://gcloud-authentication-493914627855.us-central1.run.app"; 

/**
 * Exchanges a Firebase ID token for a Cloud Run token
 * 
 * @param idToken Firebase ID token
 * @returns Cloud Run token string
 */
export const getCloudRunToken = async (idToken: string): Promise<string> => {
  try {
    console.log(`Requesting Cloud Run token from ${AUTH_SERVICE_URL}/auth/public-token`);
    
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/auth/public-token`, 
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.token) {
      return response.data.token;
    } else {
      throw new Error('Invalid response from auth service');
    }
  } catch (error) {
    console.error('Error getting Cloud Run token:', error);
    throw error;
  }
};