export async function apiRequest(endpoint: string, options: any = {}) {
  const res = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return res.json();
}