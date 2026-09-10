import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사이 · 한일 실시간 통역",
  description: "한국어와 일본어를 음성과 텍스트로 통역하는 간단한 대화창.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
