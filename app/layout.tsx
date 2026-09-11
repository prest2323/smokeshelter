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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <style>{`body{font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif}.font-display{font-family:'Fraunces',Georgia,'Times New Roman',serif;letter-spacing:-.02em}::selection{background:#c9a84c;color:#14100a}main h1{font-size:clamp(34px,6vw,54px)!important}button{transition:transform .12s ease,box-shadow .12s ease}button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 22px rgba(201,168,76,.35)}@media(max-width:480px){button,select{width:100%}}`}</style>
      </head>
      <body
        style={{
          margin: 0,
          background: 'radial-gradient(1200px 600px at 50% -10%, #16241d 0%, #0d1512 55%)',
          backgroundColor: '#0d1512',
          color: '#f2ede1',
        }}
      >
        {children}
      </body>
    </html>
  );
}
