import * as AuthService from '../auth/AuthService';

export interface UploadSasUrlResponse {
  userId: string;
  uploadSasUrl: string;
}

const API_SCOPE = process.env.REACT_APP_API_SCOPE as string;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL as string;

async function getAccessToken() {
  const account = AuthService.msalInstance.getActiveAccount();
  if (!account) throw new Error('User not logged in.');
  
  const request = { scopes: [API_SCOPE] };
  const response = await AuthService.msalInstance.acquireTokenSilent(request);
  return response.accessToken;
}

export async function getUploadSasUrl(): Promise<UploadSasUrlResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/video/upload-sas-url`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload SAS URL: ${response.status}`);
  }

  const result: UploadSasUrlResponse = await response.json();
  return result;
}

export async function uploadVideoToBlob(videoFile: File, uploadSasUrl: string, userId: string): Promise<void> {
  const response = await fetch(uploadSasUrl, {
    method: 'PUT',
    body: videoFile,
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-meta-userId': userId,
      'x-ms-meta-VideoId': "8af5aac8-ec58-46bf-828e-04bbf0f580b3", // Ensure this is a string
      'x-ms-meta-SessionId': "6bd200a1-f98f-43f1-ab2a-b7122d77f171",
      'x-ms-meta-CreatedAt': new Date().toISOString(), // Standard date string
      'x-ms-meta-OrderNumber': "1",
      'x-ms-meta-IsFull': "false",
    },
  });

  if (!response.ok) {
    throw new Error(`Blob upload failed: ${response.status}`);
  }
}
