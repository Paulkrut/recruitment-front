import React from "react";
import { Providers } from "@/store/providers";
import MyApp from "./app";
import "./global.css";
import YandexMetrika from "@/components/YandexMetrika";

export const metadata = {
  title: "Spike Dark Demo",
  description: "Spike Dark kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <MyApp>{children}</MyApp>
        </Providers>
        <YandexMetrika />
      </body>
    </html>
  );
}
