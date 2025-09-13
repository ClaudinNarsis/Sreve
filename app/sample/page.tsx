'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import './sample.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SignInButton, useClerk } from '@clerk/nextjs';
import { Resizable } from 'react-resizable';

function SampleContent() {
  const searchParams = useSearchParams();
  const answer = searchParams.get('answer') || '';
  const [loading, setLoading] = useState(true);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [messages, setMessages] = useState([
    { text: 'what changes would you like me to do?', sender: 'bot' }
  ]);
  const [userInput, setUserInput] = useState('');
  const { openSignIn } = useClerk();

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      const words = answer.split(' ');
      let currentWordIndex = 0;

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          setDisplayedAnswer((prev) => prev + ' ' + words[currentWordIndex]);
          currentWordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 100); // Adjust typing speed here

      return () => clearInterval(interval);
    }
  }, [loading, answer]);

  const onResize = (event, { size }) => {
    setSidebarWidth(size.width);
  };

  const handleSendMessage = () => {
    if (userInput.trim() !== '') {
      setMessages([...messages, { text: userInput, sender: 'user' }]);
      setUserInput('');
      openSignIn();
    }
  };

  return (
    <div className="sample-page">
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <img src="/assets/logo.png" alt="Sreve Logo" className="logo" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/">Home</Link>
        </nav>
      </header>

      <div className="main-container">
        <main className="sample-content">
          <div className="container">
            <div className="answer-container">
              <div className="answer-content">
                {loading ? (
                  <div className="loading-container">Thinking ...</div>
                ) : (
                  <div className="formatted-answer">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedAnswer}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="cta-section">
                <p>Customise this for your brand? or want to chat with this answer?</p>
                <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                  <button className="cta-button">Get Started</button>
                </SignInButton>
              </div>
            </div>
          </div>
        </main>
        <Resizable
          width={sidebarWidth}
          height={0}
          onResize={onResize}
          axis="x"
          minConstraints={[200, 0]}
          maxConstraints={[500, 0]}
          className="resizable-sidebar"
        >
          <aside className="sidebar" style={{ width: sidebarWidth }}>
            <div className="chat-box">
              {messages.map((message, index) => (
                <div key={index} className={`chat-message ${message.sender}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="prompt-box">
              <input
                type="text"
                placeholder="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <button onClick={handleSendMessage}>Go</button>
            </div>
          </aside>
        </Resizable>
      </div>
    </div>
  );
}

export default function SamplePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SampleContent />
    </Suspense>
  );
}
