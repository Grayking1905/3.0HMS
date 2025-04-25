import Link from 'next/link';
import { Hospital, User } from 'lucide-react'; // Using Hospital icon
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';


export function Header() {
  // Placeholder user data - replace with actual user auth state later
  const user = {
    name: 'Patient User',
    email: 'patient@example.com',
    avatarUrl: 'https://picsum.photos/seed/user1/40/40'
  };
  const isLoggedIn = true; // Assume user is logged in for now

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

        <div className="ml-auto flex items-center space-x-4">
          {isLoggedIn ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('') || <User className="h-4 w-4"/>}</AvatarFallback>
                    </Avatar>
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button>Sign In</Button> // Placeholder for login button
          )}
        </div>
      </div>
    </header>
  );
}
