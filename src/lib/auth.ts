import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "am_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const PENDING_2FA_COOKIE = "am_2fa_pending";
const PENDING_2FA_TTL_SECONDS = 60 * 5; // 5 minutes to enter the code

export type CitizenSession = { kind: "fuqaro"; name: string; phone: string };
export type BankerSession = {
  kind: "banker";
  bankerId: string;
  login: string;
  ism: string;
  role: "BANKER" | "ADMIN";
  /** LoginLog row opened for this session — used to stamp logoutAt on sign-out. */
  loginLogId: string | null;
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

export function isAdmin(session: Session | null): session is BankerSession {
  return isBanker(session) && session.role === "ADMIN";
}

// ---- Password verified, TOTP still pending (short-lived, separate cookie) ----

export async function setPending2fa(bankerId: string) {
  const token = await new SignJWT({ bankerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_TTL_SECONDS}s`)
    .sign(secretKey());
  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_2FA_TTL_SECONDS,
  });
}

export async function getPending2fa(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (payload as { bankerId?: string }).bankerId ?? null;
  } catch {
    return null;
  }
}

export async function clearPending2fa() {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}
