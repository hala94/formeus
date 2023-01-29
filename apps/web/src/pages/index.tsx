import Head from "next/head";

export default function Home() {
  return (
    <div className="mx-auto max-w-[40rem] h-screen py-2 px-4 flex flex-col items-center">
      <Head>
        <title>Form Web</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen flex flex-col items-start justify-center">
        <span className="text-8xl font-black bg-gradient-to-r from-brandred to-brandblue bg-clip-text text-transparent relative flex items-center w-full">
          <h1>Form</h1>
          <span className="loader ml-10 mt-4"></span>
        </span>
        <p className="mt-4 text-xl text-slate-300 font-medium">
          Input and validation state managment library written in TypeScript.
        </p>
        <div className="text-slate-200 flex flex-col gap-3 mt-12">
          <li>UI agnostic</li>
          <li>Efficient validations, both sync and async</li>
          <li>Works with React, Svelte, Vue</li>
          <li>Supports all common form behaviours</li>
        </div>
        <button className="mt-12 h-12 text-black font-medium bg-slate-200 px-6 flex justify-center items-center rounded-md">
          Get Started
        </button>
      </main>
      {/* <Example /> */}
    </div>
  );
}
