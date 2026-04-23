import { DM_Mono, DM_Serif_Display, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"]
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"]
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
});

export const metadata = {
  title: "Wealthy and Wise",
  description:
    "Financial calculators for FIRE planning, SIP projections, and buy-versus-rent decisions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSerif.variable} ${dmMono.variable}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EJLSPRPTCK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EJLSPRPTCK');
          `}
        </Script>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
