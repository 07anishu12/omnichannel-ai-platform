import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Omnichannel platform",
  description: "Tenant-scoped omnichannel workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
