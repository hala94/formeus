import "../styles/globals.css"
import { Inter, Montserrat_Alternates, Noto_Sans, Varela_Round } from "@next/font/google"

import type { AppProps } from "next/app"
// const inter = Montserrat_Alternates({ subsets: ["latin"], weight: "400" })
const inter = Inter({ subsets: ["latin"], weight: "400" })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  )
}
