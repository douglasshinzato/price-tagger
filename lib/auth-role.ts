export type AppRole = "admin" | "employee"

export function normalizeRole(role?: string | null): AppRole {
  const value = (role ?? "employee").trim().toLowerCase()
  return value === "admin" ? "admin" : "employee"
}

export function isAdminRole(role?: string | null) {
  return normalizeRole(role) === "admin"
}