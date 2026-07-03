import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { LanguageProvider } from '@/components/layout/language-provider'
import { ArticleFontProvider } from '@/components/layout/article-font-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'impact-site-verification': '4b24f7da-a05d-4d05-9feb-497f1e4e597e',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function() {
            try {
              var theme = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })()`}
        </Script>
        <Script id="locale-init" strategy="beforeInteractive">
          {`document.documentElement.lang = 'zh-CN';`}
        </Script>
        <Script id="article-font-init" strategy="beforeInteractive">
          {`(function() {
            try {
              var font = localStorage.getItem('article-font');
              if (font === 'serif' || font === 'kai' || font === 'sans') {
                document.documentElement.dataset.articleFont = font;
              } else {
                document.documentElement.dataset.articleFont = 'sans';
              }
            } catch (e) {}
          })()`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <ArticleFontProvider>
              <Header />
              <main className="flex-1 w-full max-w-[1280px] mx-auto px-8 py-16">
                {children}
              </main>
              <Footer />
            </ArticleFontProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
