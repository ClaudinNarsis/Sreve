'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function ClientRouteHandler() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof document === 'undefined') return;
    
    try {
      // Force style recalculation on route change
      void document.body.offsetHeight;
      
      // Remove page-specific classes that might conflict
      document.body.className = document.body.className
        .replace(/\b(tools-page|blog-page|app-page)\b/g, '')
        .trim();
      
      // Add appropriate page class based on route
      if (pathname.startsWith('/tools')) {
        document.body.classList.add('tools-page');
      } else if (pathname.startsWith('/blog')) {
        document.body.classList.add('blog-page');
      } else if (pathname.startsWith('/app')) {
        document.body.classList.add('app-page');
      }
      
      // Ensure base styles are consistent
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    } catch (error) {
      console.warn('ClientRouteHandler error:', error);
    }
    
  }, [pathname, isClient]);

  return null;
}

export default ClientRouteHandler;