import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maya AI Tutor',
  description: 'A premium GCSE Biology tutor powered by Azure OpenAI and Vercel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
