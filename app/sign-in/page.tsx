import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="sign-in-container">
      <div className="sign-in-header">
        <Link href="/" className="logo-link">
          <Image src="/assets/logo.png" alt="Sreve Logo" width={73} height={37} priority />
        </Link>
      </div>

      <div className="sign-in-content">
        <div className="sign-in-welcome">
          <h1>Welcome back to Sreve</h1>
          <p>Sign in to your account and start creating scroll-stopping content</p>
        </div>

        <div className="clerk-container">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#ff6600'
              }
            }}
            redirectUrl={'/app'}
            signUpUrl={'/sign-up'}
          />
        </div>

        <div className="sign-in-footer">
          <p>
            Don't have an account? {' '}
            <Link href="/sign-up" className="sign-up-link">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      <div className="sign-in-features">
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Targeted Copy</h3>
            <p>Create ads that convert with AI that thinks like a strategist</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Generate scroll-stopping content in seconds, not hours</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <h3>Brand Voice</h3>
            <p>Maintain consistent voice across all your campaigns</p>
          </div>
        </div>
      </div>
    </div>
  );
}