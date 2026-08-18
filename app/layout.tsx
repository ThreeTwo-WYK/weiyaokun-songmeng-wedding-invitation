import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "卫垚坤 & 宋萌 · 婚礼请柬",
  description: "2026年10月3日，诚邀您来到临汾市襄汾县赵康镇绍平村，见证我们的幸福时刻。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
