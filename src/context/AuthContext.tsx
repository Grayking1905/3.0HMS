// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user state
      toast({
          title: 'Signed In',
          description: 'Successfully signed in with Google.',
      });
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      // Show specific error to the user
      toast({
          title: 'Sign In Failed',
          description: `Could not sign in with Google. ${error.message || 'Please check console for details.'}`,
          variant: 'destructive',
      });
      // Handle specific errors if needed
      // if (error.code === 'auth/popup-closed-by-user') { ... }
    } finally {
        // Ensure loading is set to false even if onAuthStateChanged hasn't fired yet
        // Small delay to allow state propagation if needed, but usually not necessary
        setTimeout(() => setLoading(false), 100);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting the user state to null
      toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
       toast({
           title: 'Sign Out Failed',
           description: error.message || 'Could not sign out.',
           variant: 'destructive',
       });
       // Handle error
    } finally {
         // Ensure loading is set to false
         setTimeout(() => setLoading(false), 100);
    }
  };

  // Display loading indicator while checking auth state
  if (loading && !user) { // Only show full screen loading initially
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
         </div>
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
