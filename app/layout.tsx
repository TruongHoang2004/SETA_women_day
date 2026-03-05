import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Đăng Ký Sự Kiện 8/3",
  description: "Form đăng ký tham gia sự kiện 8/3 và nhận số may mắn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={outfit.className}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
