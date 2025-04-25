import Link from 'next/link';
import { Hospital } from 'lucide-react'; // Using Hospital icon

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Hospital className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">
            HealthChain
          </span>
        </Link>
        {/* Navigation or User Actions can be added here later */}
        {/* Example:
        <nav className="flex items-center space-x-6 text-sm font-medium ml-auto">
          <Link href="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
          <Link href="/profile" className="transition-colors hover:text-primary">Profile</Link>
        </nav>
        */}
      </div>
    </header>
  );
}
