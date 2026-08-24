import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LaporPohon - Platform Deteksi & Pelaporan Pohon Rawan Tumbang',
  description: 'Ekosistem cerdas pemetaan & pelaporan pohon berbasis AI YOLOv8 demi keselamatan publik',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}