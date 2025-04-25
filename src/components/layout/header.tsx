// src/components/layout/header.tsx
'use client'; // Add 'use client' because we are using hooks (useAuth)

import Link from 'next/link';
import { Hospital, User, LogIn, LogOut } from 'lucide-react'; // Import LogIn, LogOut
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth(); // Use the auth context

  const getInitials = (name?: string | null) => {
      if (!name) return '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Hospital className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">
            HealthChain
          </span>
        </Link>

        {/* Optional Navigation Links */}
        {/* <nav className="flex items-center space-x-4 text-sm font-medium">
          <Link href="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
          <Link href="/profile" className="transition-colors hover:text-primary">Profile</Link>
        </nav> */}

        <div className="ml-auto flex items-center space-x-4">
          {loading ? (
            // Optional: Add a skeleton loader for the user area
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(user.displayName) || <User className="h-4 w-4"/>}</AvatarFallback>
                    </Avatar>
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <Link href="/profile" passHref legacyBehavior>
                     <DropdownMenuItem> {/* Link to Profile page */}
                        <User className="mr-2 h-4 w-4" />
                       <span>Profile</span>
                     </DropdownMenuItem>
                 </Link>
                {/* Add other items like Settings if needed */}
                {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signInWithGoogle} variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
