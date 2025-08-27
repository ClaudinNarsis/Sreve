import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="sign-in-container">
      <div className="sign-in-header">
        <Link href="/" className="logo-link">
          <Image src="/assets/logo.png" alt="Sreve Logo" width={73} height={37} priority />
        </Link>
      </div>

      <div className="sign-in-content">
        <div className="sign-in-welcome">
          <h1>Join Sreve Today</h1>
          <p>Start creating scroll-stopping content with AI that thinks like a strategist</p>
        </div>

        <div className="clerk-container">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#ff6600'
              }
            }}
            redirectUrl={'/onboarding'}
            signInUrl={'/sign-in'}
          />
        </div>

        <div className="sign-in-footer">
          <p>
            Already have an account? {' '}
            <Link href="/sign-in" className="sign-up-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="sign-in-features">
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3>Free to Start</h3>
            <p>Get 20 AI-generated ideas every month at no cost</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Performance Focused</h3>
            <p>Built specifically for agencies and performance marketers</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Instant Setup</h3>
            <p>Start creating winning campaigns in under 5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}