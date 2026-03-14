import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "sonner";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "OmniiLearn | Gamified Education Platform",
  description: "Learn anything. Level up every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.className} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 800,
              borderRadius: "1rem",
            },
          }}
        />
      </body>
    </html>
  );
}
