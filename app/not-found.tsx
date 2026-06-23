import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <p className="text-white/50">Page not found</p>
        <Link href="/" className="btn-primary inline-flex">
          Go home
        </Link>
      </div>
    </main>
  );
}
