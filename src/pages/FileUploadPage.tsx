import React from 'react';
import { useFileHandler } from '../hooks/useFileHandler';
import UploadDropZone from '../components/UploadDropZone';
import '../styles/pages.css';


const FileUploadPage: React.FC = () => {
  const {
    state: {
      file,
      isLoading,
      error,
      sasUrl,
      isDragging,
    },
    handlers: {
      uploadFile,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleButtonClick,            
    }
  } = useFileHandler();

  return (
    <div className="page-container">
      <header className="header">
        <div className="logo">BAR CLIP</div>
      </header>

      <main className="main-container">
        <div className="page-title upload-page-title">
          <h1>BAR CLIP</h1>
          <p>Automated Video Trimming For Lifting Videos</p>
        </div>
        

        <UploadDropZone className={isDragging ? 'drag-over' : ''} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onButtonClick={handleButtonClick} />

        {sasUrl && (
          <div className="success-message">
            <div className="video-container">
              <video className="video-player" src={sasUrl} controls />
            </div>
            <p>Trimming Complete! <a href={sasUrl} target="_blank" rel="noopener noreferrer">Download Trimmed Video</a></p>
          </div>
        )}

        <div className="upload-button-container">
          {file && (
            <button className="upload-button" onClick={uploadFile} disabled={isLoading}>
              {isLoading ? 'Trimming...' : 'Trim Video'}
            </button>
          )}
        </div>

        {isLoading && <div className="status-message">Trimming...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {file && (
          <div className="file-info">
            <p>Original Video File: {file.name}</p>
          </div>
        )}
      </main>

      <div className="background-animation" />
    </div>
  );
};

export default FileUploadPage;