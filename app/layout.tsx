import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from 'sonner'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "企業経営入門投票システム",
  description: "企業経営入門投票システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={GeistSans.className} suppressHydrationWarning={true}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
