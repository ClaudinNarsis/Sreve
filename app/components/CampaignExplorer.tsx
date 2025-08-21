import React, { useState, useRef, useCallback } from 'react';
import './CampaignExplorer.css';

interface CampaignExplorerProps {
  campaignId: string | null;
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId }) => {
  const [detailsPaneWidth, setDetailsPaneWidth] = useState(400);
  const [detailsPaneHeight, setDetailsPaneHeight] = useState(300);
  const [ideaViewWidth, setIdeaViewWidth] = useState(400);
  const [ideaViewHeight, setIdeaViewHeight] = useState(300);
  const [chatBoxHeight, setChatBoxHeight] = useState(200);

  const detailsResizeRef = useRef<HTMLDivElement>(null);
  const ideaResizeRef = useRef<HTMLDivElement>(null);
  const chatResizeRef = useRef<HTMLDivElement>(null);

  const handleDetailsResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = detailsPaneWidth;
    const startHeight = detailsPaneHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));
      setDetailsPaneWidth(newWidth);
      setDetailsPaneHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [detailsPaneWidth, detailsPaneHeight]);

  const handleIdeaResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ideaViewWidth;
    const startHeight = ideaViewHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, startWidth - (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));
      setIdeaViewWidth(newWidth);
      setIdeaViewHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [ideaViewWidth, ideaViewHeight]);

  const handleChatResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = chatBoxHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = Math.max(100, startHeight - (e.clientY - startY));
      setChatBoxHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [chatBoxHeight]);

  return (
    <div className="campaign-explorer-layout">
      {/* Details Pane - Top Left */}
      <div 
        className="details-pane"
        style={{
          width: `${detailsPaneWidth}px`,
          height: `${detailsPaneHeight}px`
        }}
      >
        <div className="pane-header">
          <h3>Details</h3>
        </div>
        <div className="pane-content">
          {/* Empty for now */}
        </div>
        <div 
          className="resize-handle resize-handle-se"
          onMouseDown={handleDetailsResize}
          ref={detailsResizeRef}
        />
      </div>

      {/* Idea View - Top Right */}
      <div 
        className="idea-view"
        style={{
          width: `${ideaViewWidth}px`,
          height: `${ideaViewHeight}px`
        }}
      >
        <div className="pane-header">
          <h3>Ideas</h3>
        </div>
        <div className="pane-content">
          {/* Empty for now */}
        </div>
        <div 
          className="resize-handle resize-handle-sw"
          onMouseDown={handleIdeaResize}
          ref={ideaResizeRef}
        />
      </div>

      {/* Chat Box - Bottom Center */}
      <div 
        className="chat-box"
        style={{
          height: `${chatBoxHeight}px`
        }}
      >
        <div 
          className="resize-handle resize-handle-n"
          onMouseDown={handleChatResize}
          ref={chatResizeRef}
        />
        <div className="pane-header">
          <h3>Chat</h3>
        </div>
        <div className="pane-content">
          {/* Empty for now */}
        </div>
      </div>
    </div>
  );
};

export default CampaignExplorer;
