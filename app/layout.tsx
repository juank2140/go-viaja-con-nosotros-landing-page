import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Cormorant_Garamond, Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Go Viaja Con Nosotros | Un número, un destino, un sueño',
  description:
    'Participa en nuestra rifa y gana un viaje a Cancún para 2 personas, hotel RIU 4★ todo incluido + $3.000.000 COP. El mundo te espera, nosotros te llevamos.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${cormorant.variable} bg-background`}
    >
      <head>
        <Script src="https://checkout.bold.co/library/boldPaymentButton.js" strategy="beforeInteractive" />
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','2020636644865927');
          fbq('track','PageView');
        `}</Script>
        <noscript><img height="1" width="1" style={{display:'none'}} src="https://www.facebook.com/tr?id=2020636644865927&ev=PageView&noscript=1" /></noscript>
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
