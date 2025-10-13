'use client';

import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

interface LocalizedFooterProps {
  dict: Dictionary;
  lang: Locale;
}

export default function LocalizedFooter({ dict, lang }: LocalizedFooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>{dict.footer.aiTools}</h4>
              <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="/tools/ai-caption-generator" onClick={(e) => handleNavigation(e, '/tools/ai-caption-generator')}>{dict.tools.captionGenerator}</a></li>
                <li><a href="/tools/ai-content-generator" onClick={(e) => handleNavigation(e, '/tools/ai-content-generator')}>{dict.tools.contentGenerator}</a></li>
                <li><a href="/tools/blog-idea-generator" onClick={(e) => handleNavigation(e, '/tools/blog-idea-generator')}>{dict.tools.blogIdeas}</a></li>
                <li><a href="/tools/social-media-post-generator" onClick={(e) => handleNavigation(e, '/tools/social-media-post-generator')}>{dict.tools.socialPosts}</a></li>
                <li><a href="/tools/ai-sentence-rewriter" onClick={(e) => handleNavigation(e, '/tools/ai-sentence-rewriter')}>{dict.tools.sentenceRewriter}</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>{dict.footer.resources}</h4>
              <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="/blog" onClick={(e) => handleNavigation(e, '/blog')}>{dict.common.blog}</a></li>
                <li><a href="/blog/cheaper-jasper-alternative-2025" onClick={(e) => handleNavigation(e, '/blog/cheaper-jasper-alternative-2025')}>Jasper Alternative</a></li>
                <li><a href="/blog/top-5-tools-for-creative-and-marketing-agencies" onClick={(e) => handleNavigation(e, '/blog/top-5-tools-for-creative-and-marketing-agencies')}>Agency AI Tools</a></li>
                <li><a href="/tools" onClick={(e) => handleNavigation(e, '/tools')}>{dict.common.tools}</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>{dict.footer.company}</h4>
              <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="/privacy-policy">{dict.footer.privacyPolicy}</a></li>
                <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank">{dict.footer.contact}</a></li>
                <li><a href={`/${lang}#pricing`}>{dict.common.pricing}</a></li>
                <li><a href={`/${lang}#features`}>{dict.common.features}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} Sreve. {dict.footer.allRightsReserved}.</p>
      </div>
    </footer>
  );
}
