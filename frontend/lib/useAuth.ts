"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  type: "student" | "client";
};

export default function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.id || !parsedUser?.type) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.clear();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { user, loading };
}