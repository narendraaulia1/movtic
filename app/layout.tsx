import "./globals.css";
import { ReactNode } from "react";
import Providers from "./providers"; // kita buat khusus client provider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
