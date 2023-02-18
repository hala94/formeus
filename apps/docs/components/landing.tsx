import { useRouter } from "next/router"
import { useState } from "react"
import cn from "classnames"

export function Landing() {
  return (
    <div>
      <h1
        className={cn(
          "bg-clip-text text-transparent mt-12 text-4xl font-extrabold bg-gradient-to-br from-black to-slate-300",
          "sm:w-[80%] sm:text-5xl",
          "md:text-6xl md:leading-[1.1]",
          "lg:w-[60%] lg:mt-20",
          "dark:from-white dark:to-slate-900"
        )}
      >
        Powerful form state managment for TS, React, Solid, Vue and Svelte.
      </h1>
      <p className={cn("mt-5 leading-relaxed", "md:text-xl")}>
        Unify your application form logic, <br /> coordinate validations and
        build great user experiences.
      </p>
      <GetStartedSimple />
    </div>
  )
}

function Card() {
  return (
    <div className="border rounded-3xl border-zinc-700 dark:bg-zinc-800 p-6">
      <h3 className="text-2xl font-extrabold">Smart validations</h3>
      <p>
        Coordinate your client and server side validations with easy to use
        interface and minimal repetition. <br />
      </p>
    </div>
  )
}

function GetStartedSimple() {
  const router = useRouter()

  return (
    <button
      className={cn(
        "mt-16",
        "relative inline-block px-10 py-4 rounded-full align-middle font-extrabold transition-all duration-[300ms]",
        "bg-gradient-to-br from-brandStrong  to-brandMedium",
        "shadow-md shadow-brandLight hover:shadow-lg hover:shadow-brandLight"
      )}
      onClick={() => router.push("/docs")}
    >
      <p className={cn("text-white select-none tracking-wide font-semibold")}>
        Get started
      </p>
    </button>
  )
}

function GetStartedAnimated() {
  const router = useRouter()

  const [hover, setHover] = useState(false)

  const sharedCircleClass =
    "inline-block align-middle h-[55px] rounded-full bg-midnight"

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mt-16 relative"
      onClick={() => router.push("/docs")}
    >
      <div className={cn(sharedCircleClass, "aspect-square -z-10")}>
        <div
          id="expanding"
          className={cn(
            sharedCircleClass,
            "absolute left-0",
            hover ? "w-full" : "w-[55px]",
            "transition-all duration-[350ms]",
            "bg-gradient-to-br from-midnight via-midnight to-purple-500 dark:from-purple-500 dark:to-purple-900"
          )}
        />
      </div>
      <p
        className={cn(
          "relative inline-block ml-3 mr-7 align-middle font-extrabold z-10 transition-all duration-[350ms]",
          hover ? "text-white" : "text-midnight dark:text-white"
        )}
      >
        Get started
      </p>
    </button>
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

/*

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

*/
