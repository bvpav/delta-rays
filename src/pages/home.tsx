import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { Link } from 'wouter';

export default function HomePage() {
  const id = useMemo(() => nanoid(10), []);

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="yellow-400 mb-12 font-alatsi text-7xl font-bold tracking-wide">
          Select difficulty
        </h1>
        <Link
          href={`/easy/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Easy
        </Link>
        <br />

        <Link
          href={`/medium/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Medium
        </Link>
        <br />

        <Link
          href={`/hard/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Hard
        </Link>
        <br />
      </div>
      <br />
      <br />
    </>
  );
}
