import "../styles.css"

import { Inter } from "@next/font/google"

import type { AppProps } from "next/app"
import { Analytics } from "@vercel/analytics/react"

const poppins = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
      <Analytics />
    </main>
  )
}
