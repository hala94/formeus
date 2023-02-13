import { useRouter } from "next/router"

export function Landing() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center h-full text-black dark:text-white text-center fadeIn">
      <div className="flex items-center mt-6 md:mt-16">
        <h1 className="text-4xl md:text-5xl font-black">
          Powerful form state managment for TS, React, Solid, Vue and Svelte.
        </h1>
      </div>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 auto-rows-auto mt-12">
        <LandingCard
          title="Smart validations"
          content="Coordinate your client and server side validations with easy to use interface and minimal repetition."
        />
        <LandingCard
          title="No extra baggage"
          content="Framework specific components are not needed, your layout code
          stays readable and scalable."
        />
        <LandingCard
          title="Configurable"
          content="Unify your form behaviour across the application and provide a consistent UX to your users."
        />
      </div>
      <Button title="Get started" onClick={() => router.push("/docs")} />
    </div>
  )
}

function LandingCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 rounded-md p-[2px] background-animate">
      <div className="h-full rounded-md py-6 px-4 shadow-md flex justify-center items-center flex-col gap-8 bg-white dark:bg-midnight">
        <p className="text-3xl font-bold">{title}</p>
        <p className="text-slate-600 font-medium mx-4">{content}</p>
      </div>
    </div>
  )
}

function Button({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      className={`dark:hover:bg-gray-200 hover:bg-midnight hover:text-white border border-black transition-all font-medium text-sm dark:border-slate-200 rounded-md px-6 py-3 self-start dark:hover:text-black text-black mt-10 bg-white select-none`}
    >
      {title}
    </button>
  )
}
