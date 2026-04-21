const KEY = "trackpulse:admin";

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    localStorage.setItem(KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}
