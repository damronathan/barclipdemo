import React, { useEffect, useState } from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import FileUploadPage from './pages/FileUploadPage';
import { msalInstance } from './auth/AuthService';


function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        
        // Handle redirect response
        const response = await msalInstance.handleRedirectPromise();
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
}

        if (response) {
          window.location.href = '/upload';         
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('MSAL initialization failed:', error);
        setIsInitialized(true); // Still set to true to show the app
      }
    };

    initializeMsal();
  }, []);
  

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/upload" element={<FileUploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
