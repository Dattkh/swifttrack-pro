const KEY = "trackpulse:admin";
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "admin123";

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(KEY);
}
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}
