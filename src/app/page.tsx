import FeeCalculator from "@/components/FeeCalculator";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10 dark:bg-black sm:px-8">
      <main className="w-full max-w-5xl">
        <FeeCalculator />
      </main>
    </div>
  );
}
