export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-6">Sorry, the page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Home</a>
    </div>
  );
} 