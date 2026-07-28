import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "am_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type CitizenSession = { kind: "fuqaro"; name: string; phone: string };
export type BankerSession = {
  kind: "banker";
  bankerId: string;
  login: string;
  ism: string;
  role: "BANKER" | "ADMIN";
};
export type Session = CitizenSession | BankerSession;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function setSession(payload: Session) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export function isBanker(session: Session | null): session is BankerSession {
  return !!session && session.kind === "banker";
}

export function isAdmin(session: Session | null): boolean {
  return isBanker(session) && session.role === "ADMIN";
}
