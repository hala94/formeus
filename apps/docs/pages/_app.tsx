import "../styles.css"
import { Noto_Sans, Poppins } from "@next/font/google"

import type { AppProps } from "next/app"

const poppins = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  )
}
