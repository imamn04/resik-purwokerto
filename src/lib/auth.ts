import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AuthUser, UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "resik-purwokerto-secret-key-default-2026";
export const AUTH_COOKIE_NAME = "resik_session";

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

// Server Component / API Route Session Extractor
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Extract from API Request (Headers or Cookie)
export function getAuthFromRequest(req: NextRequest): AuthUser | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const user = verifyToken(cookieToken);
    if (user) return user;
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    return verifyToken(bearerToken);
  }

  return null;
}

// Permission checking helper
export function hasPermission(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  if (userRole === "OWNER") return true; // Owner can access everything
  return allowedRoles.includes(userRole);
}

