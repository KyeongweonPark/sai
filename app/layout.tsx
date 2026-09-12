import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사이 · 다국어 실시간 통역",
  description: "한국어, 영어, 프랑스어, 독일어, 일본어, 중국어 사이의 양방향 음성·문자 통역.",
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
