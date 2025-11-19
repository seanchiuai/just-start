"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return <>{children}</>;
}
