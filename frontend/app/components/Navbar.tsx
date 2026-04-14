"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setRole(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as { type?: string };
      setRole(parsedUser.type ?? null);
    } catch {
      setRole(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-green-100 px-6 py-3 flex justify-between items-center">
      <h1 className="text-green-700 font-semibold text-lg">GigSquad</h1>

      <div className="flex items-center gap-4">
        {role === "student" && (
          <>
            <Link href="/dashboard" className="text-sm text-gray-700">
              Dashboard
            </Link>
            <Link href="/my-applications" className="text-sm text-gray-700">
              My Applications
            </Link>
          </>
        )}

        {role === "client" && (
          <>
            <Link href="/dashboard" className="text-sm text-gray-700">
              Dashboard
            </Link>
            <Link href="/client/create-gig" className="text-sm text-gray-700">
              Create Gig
            </Link>
          </>
        )}

        <button
          onClick={handleLogout}
          className="cursor-pointer text-sm text-red-500 transition hover:scale-105 hover:text-red-600 active:scale-95"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
