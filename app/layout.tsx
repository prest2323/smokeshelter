export const metadata = {
  title: 'SmokeShelter — know smoke days, act early',
  description: 'Live wildfire-smoke action planner for teens. NextStep Hacks 2026 Earth Forward.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="%230d1512"/><text x="16" y="22" font-size="16" text-anchor="middle">🌲</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0d1512', color: '#f2ede1' }}>{children}</body>
    </html>
  );
}
