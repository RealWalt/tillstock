'use client';

import { api } from "@/lib/trpc";

export default function Home () {
  const { data } = api.hello.useQuery({ text: 'walter'})

  return (
    <main>
      <p className="flex flex-col text-2xl">
        TillStock <br />
        {data} 
      </p>
    </main>
  )
}