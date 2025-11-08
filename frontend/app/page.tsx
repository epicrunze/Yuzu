export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-4 text-yuzu-700">
          🍋 Yuzu
        </h1>
        <p className="text-xl text-center text-yuzu-600">
          Fresh Research Discovery
        </p>
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-card shadow-yuzu p-8">
            <p className="text-yuzu-800">
              Squeeze knowledge from every paper
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

