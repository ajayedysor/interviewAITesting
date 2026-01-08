"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardPage from "./dashboard/page";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionUserId = localStorage.getItem("sessionUserId");
      if (sessionUserId) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        router.replace("/login");
      }
    }
  }, [router]);

  if (isLoggedIn === null) {
    return null; // or a loading spinner
  }
  if (isLoggedIn) {
    return <DashboardPage />;
  }
  return null;
}
