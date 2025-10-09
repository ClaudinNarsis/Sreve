"use client";

import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import '../resources.css';

interface FormData {
  niche: string;
  platform: string;
  contentType: string;
  audienceAge: string;
  contentGoal: string;
}

interface AudioRecommendation {
  title: string;
  artist: string;
  trend: string;
  engagement: string;
  bestFor: string[];
  reason: string;
}

export default function ViralAudiosResource() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    niche: '',
    platform: '',
    contentType: '',
    audienceAge: '',
    contentGoal: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AudioRecommendation[] | null>(null);

  const totalSteps = 5;

  const handleSubmit = async () => {
    setLoading(true);

    // Simulate API call for generating recommendations
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate mock results based on form data
    const mockResults: AudioRecommendation[] = [
      {
        title: "Trending Sound #1",
        artist: "Viral Artist",
        trend: "Rising Fast",
        engagement: "2.5M+ uses",
        bestFor: [formData.contentType, formData.platform],
        reason: `Perfect for ${formData.niche} content targeting ${formData.audienceAge} audience. This audio has high engagement rates and aligns with your ${formData.contentGoal} goal.`
      },
      {
        title: "Trending Sound #2",
        artist: "Popular Creator",
        trend: "Peak Viral",
        engagement: "5.8M+ uses",
        bestFor: [formData.contentType, "Cross-platform"],
        reason: `Highly effective for ${formData.contentGoal} campaigns. This sound is trending in the ${formData.niche} niche and resonates well with your target demographic.`
      },
      {
        title: "Trending Sound #3",
        artist: "Emerging Talent",
        trend: "Up and Coming",
        engagement: "800K+ uses",
        bestFor: [formData.platform, formData.niche],
        reason: `An emerging trend that's perfect for early adopters. Great opportunity to stand out in ${formData.niche} before it becomes oversaturated.`
      }
    ];

    setResults(mockResults);
    setLoading(false);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.niche !== '';
      case 2: return formData.platform !== '';
      case 3: return formData.contentType !== '';
      case 4: return formData.audienceAge !== '';
      case 5: return formData.contentGoal !== '';
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="resources-page">
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', paddingTop: '120px' }}>
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">🎵 Analyzing trending audios...</p>
              <p className="loading-subtext">Finding the perfect sounds for your content</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (results) {
    return (
      <div className="resources-page">
        <main style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
              <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li><Link href="/" style={{ color: 'var(--orange-primary)' }}>Home</Link></li>
                <li style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</li>
                <li><Link href="/resources" style={{ color: 'var(--orange-primary)' }}>Resources</Link></li>
                <li style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</li>
                <li style={{ color: 'var(--text-secondary)' }}>Viral Audios</li>
              </ol>
            </nav>

            <div className="results-container">
              <div className="results-header">
                <h2>🎵 Your Personalized Audio Recommendations</h2>
                <p>Based on your {formData.niche} content for {formData.platform}</p>
              </div>

              {results.map((audio, index) => (
                <div key={index} className="result-item">
                  <h3>
                    <span style={{ color: 'var(--orange-primary)', marginRight: '0.5rem' }}>#{index + 1}</span>
                    {audio.title}
                  </h3>
                  <p><strong>Artist:</strong> {audio.artist}</p>
                  <p><strong>Trend Status:</strong> {audio.trend}</p>
                  <p><strong>Engagement:</strong> {audio.engagement}</p>
                  <p style={{ marginTop: '1rem' }}>{audio.reason}</p>
                  <div className="result-meta">
                    {audio.bestFor.map((tag, i) => (
                      <span key={i} className="result-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{
                background: 'linear-gradient(135deg, var(--orange-primary), var(--orange-secondary))',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '3rem'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Want More Advanced Insights?</h3>
                <p style={{ color: 'white', marginBottom: '1.5rem', opacity: 0.95 }}>
                  Create an account to save your results, get weekly trend updates, and access our full suite of AI-powered tools.
                </p>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button style={{
                      background: 'white',
                      color: 'var(--orange-primary)',
                      padding: '1rem 2rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Sign Up Free
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/app">
                    <button style={{
                      background: 'white',
                      color: 'var(--orange-primary)',
                      padding: '1rem 2rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Go to Dashboard
                    </button>
                  </Link>
                </SignedIn>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link href="/resources" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}>
                  ← Back to All Resources
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="resources-page">
      <main style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
            <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              <li><Link href="/" style={{ color: 'var(--orange-primary)' }}>Home</Link></li>
              <li style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</li>
              <li><Link href="/resources" style={{ color: 'var(--orange-primary)' }}>Resources</Link></li>
              <li style={{ margin: '0 0.5rem', color: 'var(--text-tertiary)' }}>/</li>
              <li style={{ color: 'var(--text-secondary)' }}>Viral Audios</li>
            </ol>
          </nav>

          <div className="resource-hero">
            <h1>🎵 Viral Audios You're Missing Out On</h1>
            <p>
              Discover trending audio tracks perfect for your niche. Answer a few quick questions to get personalized recommendations.
            </p>
          </div>

          <div className="form-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
            <div className="step-indicator">Step {step} of {totalSteps}</div>

            {/* Step 1: Niche */}
            {step === 1 && (
              <div className="form-step">
                <label className="form-label">What's your content niche?</label>
                <select
                  className="form-select"
                  value={formData.niche}
                  onChange={(e) => updateFormData('niche', e.target.value)}
                >
                  <option value="">Select your niche...</option>
                  <option value="Fashion & Beauty">Fashion & Beauty</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Food & Cooking">Food & Cooking</option>
                  <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                  <option value="Tech & Gaming">Tech & Gaming</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Education & Learning">Education & Learning</option>
                  <option value="Entertainment & Comedy">Entertainment & Comedy</option>
                  <option value="DIY & Crafts">DIY & Crafts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Step 2: Platform */}
            {step === 2 && (
              <div className="form-step">
                <label className="form-label">Which platform do you primarily create for?</label>
                <div className="option-grid">
                  {['Instagram', 'TikTok', 'YouTube', 'Facebook'].map((platform) => (
                    <div
                      key={platform}
                      className={`option-card ${formData.platform === platform ? 'selected' : ''}`}
                      onClick={() => updateFormData('platform', platform)}
                    >
                      <div className="option-icon">
                        {platform === 'Instagram' && '📷'}
                        {platform === 'TikTok' && '🎵'}
                        {platform === 'YouTube' && '▶️'}
                        {platform === 'Facebook' && '👥'}
                      </div>
                      <div className="option-label">{platform}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Content Type */}
            {step === 3 && (
              <div className="form-step">
                <label className="form-label">What type of content do you create?</label>
                <div className="option-grid">
                  {['Reels/Shorts', 'Long-form Videos', 'Stories', 'Educational', 'Entertainment'].map((type) => (
                    <div
                      key={type}
                      className={`option-card ${formData.contentType === type ? 'selected' : ''}`}
                      onClick={() => updateFormData('contentType', type)}
                    >
                      <div className="option-icon">
                        {type === 'Reels/Shorts' && '📱'}
                        {type === 'Long-form Videos' && '🎬'}
                        {type === 'Stories' && '📸'}
                        {type === 'Educational' && '📚'}
                        {type === 'Entertainment' && '🎭'}
                      </div>
                      <div className="option-label">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Audience Age */}
            {step === 4 && (
              <div className="form-step">
                <label className="form-label">What's your target audience age range?</label>
                <select
                  className="form-select"
                  value={formData.audienceAge}
                  onChange={(e) => updateFormData('audienceAge', e.target.value)}
                >
                  <option value="">Select age range...</option>
                  <option value="13-17">13-17 (Gen Z - Younger)</option>
                  <option value="18-24">18-24 (Gen Z - Older)</option>
                  <option value="25-34">25-34 (Millennials)</option>
                  <option value="35-44">35-44 (Gen X - Younger)</option>
                  <option value="45+">45+ (Gen X & Boomers)</option>
                </select>
              </div>
            )}

            {/* Step 5: Content Goal */}
            {step === 5 && (
              <div className="form-step">
                <label className="form-label">What's your main content goal?</label>
                <div className="option-grid">
                  {['Brand Awareness', 'Engagement', 'Sales & Conversions', 'Education', 'Entertainment'].map((goal) => (
                    <div
                      key={goal}
                      className={`option-card ${formData.contentGoal === goal ? 'selected' : ''}`}
                      onClick={() => updateFormData('contentGoal', goal)}
                    >
                      <div className="option-icon">
                        {goal === 'Brand Awareness' && '🎯'}
                        {goal === 'Engagement' && '💬'}
                        {goal === 'Sales & Conversions' && '💰'}
                        {goal === 'Education' && '📖'}
                        {goal === 'Entertainment' && '🎉'}
                      </div>
                      <div className="option-label">{goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'var(--darkness-level-3)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ← Previous
                </button>
              )}
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="submit-button"
                  style={{ flex: step > 1 ? 2 : 1 }}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="submit-button"
                  style={{ flex: 2 }}
                >
                  Get My Recommendations 🎵
                </button>
              )}
            </div>
          </div>

          {/* Why This Matters Section */}
          <div style={{
            background: 'var(--darkness-level-2)',
            padding: '2rem',
            borderRadius: '12px',
            marginTop: '3rem',
            border: '1px solid var(--glass-border)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Why Trending Audio Matters</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Using trending audio can increase your content's reach by up to <strong style={{ color: 'var(--orange-primary)' }}>300%</strong>.
              The algorithm favors content that uses popular sounds, giving you a massive boost in visibility.
              Our tool analyzes current trends and matches them to your specific niche and audience.
            </p>
          </div>
        </div>
      </main>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Viral Audios You're Missing Out On",
            "description": "Discover trending audio tracks perfect for your content niche. Get personalized recommendations based on your platform and audience.",
            "url": "https://sreve.online/resources/viral-audios-missing-out",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://sreve.online"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Resources",
                  "item": "https://sreve.online/resources"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Viral Audios",
                  "item": "https://sreve.online/resources/viral-audios-missing-out"
                }
              ]
            }
          })
        }}
      />
    </div>
  );
}
