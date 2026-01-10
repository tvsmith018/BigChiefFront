'use client';

import { useEffect } from 'react';

export default function ErudaScript() {
  useEffect(() => {
    // Only load Eruda in a development environment and if running in the browser
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isErudaEnabled = window.location.search.includes('eruda=true') || localStorage.getItem('active-eruda') === 'true';
      
      // Load Eruda only on mobile devices or if enabled via URL/localStorage
      if (isMobile || isErudaEnabled) {
        import('eruda').then((eruda) => {
          eruda.default.init();
        });
      }
    }
  }, []);

  return null;
}