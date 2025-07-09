import { useState, useCallback } from 'react';
import { msalInstance } from '../auth/AuthService';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

interface UploadSasUrlResponse {
  userId: string;
  uploadSasUrl: string;
}
export function useFileHandler() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSasUrlResponse, setUploadSasUrlResponse] = useState<UploadSasUrlResponse | null>(null);
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);

  const pickFile = useCallback(async () => {
    console.log('🚀 Starting file pick process...');
    try {
      const filePicker = document.createElement('input');
      filePicker.type = 'file';
      filePicker.accept = 'video/*';
      
      filePicker.onchange = (e) => {
        console.log('📁 File input change detected');
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('📄 File selected:', {
            name: file.name,
            type: file.type,
            size: file.size
          });

          // Check if it's a video file
          if (!file.type.startsWith('video/')) {
            console.error('❌ Invalid file type:', file.type);
            setError('Please select a video file only.');
            return;
          }

          // Create FormData and append the file
          const formData = new FormData();
          formData.append('VideoFile', file, file.name);
          console.log('📦 FormData created with file');

          // Update state
          setFile(file);
          setError(null);
          console.log('✅ State updated with file and FormData');
        }
      };

      console.log('🖱️ Opening file picker dialog');
      filePicker.click();
    } catch (err) {
      console.error('❌ Error in pickFile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while picking the file');
    }
  }, []);

  const handleDragOver = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFile(e.dataTransfer.files[0]);
  }, []);

  const handleButtonClick = useCallback(() => {
    pickFile();
  }, [pickFile]);

  const uploadFile = useCallback(async () => {
    if (!file) {
      console.error('❌ No file selected for upload');
      setError('Please select a file first');
      return;
    }

        

    console.log('🎥 Starting video upload process...');
    try {
      const uploadSasUrlResponse = await getUploadSasUrl();
      setIsLoading(true);
      setError(null);
      console.log('⏳ Loading state set to true');

      
      console.log('📤 Sending PUT request to blob storage...');
      if(uploadSasUrlResponse?.uploadSasUrl) {
        const response = await fetch(uploadSasUrlResponse?.uploadSasUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'x-ms-meta-userId': uploadSasUrlResponse?.userId,
          },
        });
        setIsLoading(false);
        console.log('📤 Response received:', response);
        if (!response.ok) {
          console.error('❌ Server responded with error:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      else {      
        console.error('❌ No upload SAS URL found');
        setError('Failed to get upload SAS URL');
        return;
      }
    } catch (error) {
      console.error('❌ Error in uploadFile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setIsLoading(false);
      console.log('❌ Upload process failed');
      throw error;
    }
  }, [file]);

  const getUploadSasUrl = useCallback(async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      throw new Error("No active account. User might not be signed in.");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const request = {
        scopes: ["api://80b6e866-6d3e-4636-a317-7a3d73686925/access-as-user"],
      };
      const testResponse = await msalInstance.acquireTokenSilent(request);
      console.log(testResponse);
      startSignalR(testResponse.accessToken);

      const response = await fetch('http://192.168.1.71:5273/api/users/upload-sas-url', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testResponse.accessToken}`
        },
      });
      
      if (!response.ok) {
        console.error('❌ Upload SAS URL request failed:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('📥 Upload SAS URL response received, parsing JSON...');
      const result: UploadSasUrlResponse = await response.json();
      console.log('✅ Upload SAS URL result:', result);
      
      setUploadSasUrlResponse(result);
      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('❌ Error in getUploadSasUrl:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get upload SAS URL';
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  }, []);

  async function startSignalR(accessToken: string) {
    console.log('🔌 Starting SignalR connection setup...');
    console.log('🔑 Access token length:', accessToken?.length || 0);
    console.log('🔑 Access token preview:', accessToken?.substring(0, 20) + '...');
    
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(`http://192.168.1.71:5273/videoStatus?access_token=${accessToken}`)
        .withAutomaticReconnect()
        .build();

      console.log('🏗️ HubConnectionBuilder created successfully');

      setHubConnection(connection);

      connection.on("TrimSucceeded", (url: string) => {
        console.log("🎉 TrimSucceeded SAS URL received:", url);
        setSasUrl(url);
      });

      connection.onclose((error) => {
        console.log('❌ SignalR connection closed:', error);
      });

      connection.onreconnecting((error) => {
        console.log('🔄 SignalR reconnecting:', error);
      });

      connection.onreconnected((connectionId) => {
        console.log('✅ SignalR reconnected with connection ID:', connectionId);
      });

      console.log('🚀 Attempting to start SignalR connection...');
      await connection.start();
      console.log('✅ SignalR connected successfully!');
      console.log('🔗 Connection ID:', connection.connectionId);
      console.log('🔗 Connection state:', connection.state);
      
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      throw error;
    }
  }

  return {
    state: {
      file,
      isLoading,
      error,
      sasUrl,
      isDragging,
      uploadSasUrlResponse
    },
    handlers: {
      uploadFile,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleButtonClick,
      getUploadSasUrl
    }
  };
}
