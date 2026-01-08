import type { Metadata } from 'next'
import './globals.css'

// Filter out MediaPipe/TFLite INFO log spam
if (typeof window !== 'undefined') {
  const originalConsoleError = window.console.error;
  window.console.error = function (...args) {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('INFO: Created TensorFlow Lite XNNPACK delegate for CPU.')
    ) {
      return;
    }
    originalConsoleError.apply(window.console, args);
  };
}

export const metadata: Metadata = {
  title: 'Muskan.ai - AI-Powered Interview Platform',
  description: 'Prepare for your university interviews with our comprehensive AI-powered interview platform. Practice with intelligent interviews, access question banks, and improve your chances of success.',
  keywords: 'mock interview, CAS interview, university application, interview preparation, Muskan.ai, study abroad, AI interview',
  authors: [{ name: 'Muskan.ai' }],
  creator: 'Muskan.ai',
  publisher: 'Muskan.ai',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
