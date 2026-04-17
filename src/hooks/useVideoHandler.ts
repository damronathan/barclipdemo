import { useCallback, useEffect, useState } from "react";
import * as AuthService from '../auth/AuthService';
import * as signalRClient from '../client/signalRClient';
import * as videoClient from '../client/videoClient';

export function useVideoHandler() {
  const [video, setVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [uploadSasUrlResponse, setUploadSasUrlResponse] = useState<videoClient.UploadSasUrlResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const token = await AuthService.getAccessToken();
        setAccessToken(token);
      } catch {
      }
    }
    fetchToken();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    signalRClient.startSignalRConnection(accessToken, (url: string) => {
      if (isMounted) {
        setSasUrl(url);
        setIsLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        setError('SignalR connection failed');
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      signalRClient.stopSignalRConnection();
    };
  }, [accessToken]);

  const getUploadSasUrl = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(true);
      setError("User not logged in. Redirecting to sign in...");
      setTimeout(() => {
        AuthService.signIn();
      }, 2000);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await videoClient.getUploadSasUrl();
      setUploadSasUrlResponse(response);
      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get upload SAS URL';
      setError(errorMessage);
      throw err;
    }
  }, [accessToken]);

  const trimVideo = useCallback(async () => {
    if (!video) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const uploadResponse = await getUploadSasUrl();
      if (!uploadResponse) {
        return;
      }

      await videoClient.uploadVideoToBlob(video, uploadResponse.uploadSasUrl, uploadResponse.userId);
      
      console.log('File successfully uploaded to blob storage. Trim pending...');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    }
  }, [video, getUploadSasUrl]);

  return {
    state: { video, isLoading, error, sasUrl, uploadSasUrlResponse },
    handlers: { setVideo, trimVideo, getUploadSasUrl },
  };
}
