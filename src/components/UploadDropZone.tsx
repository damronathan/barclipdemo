import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useFileHandler } from '../hooks/useFileHandler';

interface UploadDropZoneProps {
  className?: string;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onButtonClick: () => void;
}

const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  className,
  onDrop,
  onDragOver,
  onDragLeave,
  onButtonClick
}) => {

  

  return (
    <Container 
      className={`${className} 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <UploadText>
        <UploadButton onClick={onButtonClick}>
          Choose Video
        </UploadButton>
      </UploadText>
    </Container>
  );
};

const Container = styled.div`
  background: #1f2937;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &.drag-over {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(37, 99, 235, 0.02);
  }

  .file-input {
    display: none;
  }
`;

const UploadText = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 1.1rem;
    color: #9ca3af;
    margin-bottom: 2rem;
    max-width: 500px;
    line-height: 1.6;
    letter-spacing: 0.5px;
  }
`;

const UploadButton = styled.button`
  background: #2563eb;
  color: white;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default UploadDropZone;
