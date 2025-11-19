"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth (middleware handles protection)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div role="status" className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
