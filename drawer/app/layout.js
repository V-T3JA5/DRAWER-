import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

// next/font self-hosts these at build time (no runtime CDN calls), per
// the spec. This does need network access DURING the build to fetch the
// font files the first time — normal for any real dev machine, just
// flagging it since this sandbox has none.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Drawer — your egd guide',
  description: 'Engineering Graphics and Design, week by week.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        {children}
        <div className="site-watermark" aria-hidden="true">T</div>
      </body>
    </html>
  );
}
