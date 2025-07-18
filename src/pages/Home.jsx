function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-4 text-center">Welcome to Young Eagles PWA</h1>
      <p className="text-xl text-center mb-8 max-w-2xl">
        Your comprehensive platform for education management, connecting students, parents, and teachers seamlessly.
      </p>
      <div className="flex space-x-4">
        <a
          href="/login"
          className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg shadow-lg font-semibold text-lg transition duration-300 ease-in-out"
        >
          Login
        </a>
        <a
          href="/register"
          className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg shadow-lg font-semibold text-lg transition duration-300 ease-in-out"
        >
          Register
        </a>
      </div>
    </div>
  )
}

export default Home
