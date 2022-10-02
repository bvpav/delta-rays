import MersenneTwister19937 from './twister';

export default function mersenne(seed: string) {
  const gen = new MersenneTwister19937();
  gen.initByArray(
    [...seed].map((c) => c.charCodeAt(0)),
    seed.length
  );
  return {
    range(min = 0, max = 2 ** 15) {
      return Math.floor(gen.genrandReal2() * (max - min) + min);
    },
  };
}

export type RNG = ReturnType<typeof mersenne>;
