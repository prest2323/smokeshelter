export const metadata = {
  title: 'SmokeShelter — know smoke days, act early',
  description: 'Live wildfire-smoke action planner for teens. NextStep Hacks 2026 Earth Forward.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0d1512', color: '#f2ede1' }}>{children}</body>
    </html>
  );
}
