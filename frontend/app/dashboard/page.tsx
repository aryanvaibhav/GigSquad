"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    apiRequest("/api/v1/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(setData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}