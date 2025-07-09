import React from 'react';
import { signIn } from '../auth/AuthService';
import '../styles/pages.css';

const WelcomePage: React.FC = () => {
  return (
    <div className="page-container">
      <header className="header">
        <div className="logo">BAR CLIP</div>
      </header>

      <main className="main-container">
        <div className="page-title">
          <h1>BAR CLIP</h1>
          <p>Automated Video Trimming For Lifting Videos</p>
        </div>

        <div className="button-container">
          <button className="get-started-button" onClick={signIn}>
            Get Started
          </button> 
        </div>
      </main>
      <div className="background-animation" />
    </div>
  );
};

export default WelcomePage;
