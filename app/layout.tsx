import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduLinux - Apprends le Terminal",
  description: "Une plateforme interactive pour maîtriser Linux et le terminal, inspirée de Duolingo et Bandit",
  keywords: ["Linux", "Terminal", "Éducation", "SSH", "Bash", "Command Line"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
