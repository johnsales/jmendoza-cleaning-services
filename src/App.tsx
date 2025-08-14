export default function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-100">
      <div className="max-w-md w-full rounded-2xl p-8 shadow bg-white">
        <h1 className="text-2xl font-bold mb-2">React + Tailwind v4 + TS</h1>
        <p className="text-gray-600 mb-6">If this looks styled, Tailwind is working 🎉</p>
        <button className="px-4 py-2 rounded-xl border shadow hover:shadow-md transition">
          Test Button
        </button>
      </div>
    </div>
  )
}