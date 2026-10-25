import net from "net";

let dbAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_COOLDOWN_MS = 30000; // 30 soniya keshda saqlash
const PROBE_TIMEOUT_MS = 150; // 150ms port tekshiruvi

/**
 * PostgreSQL ma'lumotlar bazasi mavjudligini tezkor tekshiradi (20ms ichida).
 * Natija 30 soniya davomida xotirada saqlanadi, shuning uchun keyingi barcha so'rovlar 0ms da ishlaydi.
 */
export async function isDbAvailable(): Promise<boolean> {
  const now = Date.now();
  if (dbAvailable !== null && now - lastCheckTime < CHECK_COOLDOWN_MS) {
    return dbAvailable;
  }

  // URL dan host va portni ajratib olish (default: localhost:5432)
  let host = "localhost";
  let port = 5432;

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const match = dbUrl.match(/@([^:/]+)(?::(\d+))?/);
      if (match) {
        if (match[1]) host = match[1];
        if (match[2]) port = parseInt(match[2], 10);
      }
    }
  } catch {
    // default qiymatlar
  }

  return new Promise((resolve) => {
    let settled = false;
    const socket = net.createConnection({ host, port, timeout: PROBE_TIMEOUT_MS });

    const finish = (status: boolean) => {
      if (!settled) {
        settled = true;
        dbAvailable = status;
        lastCheckTime = Date.now();
        socket.destroy();
        resolve(status);
      }
    };

    socket.on("connect", () => finish(true));
    socket.on("error", () => finish(false));
    socket.on("timeout", () => finish(false));
  });
}

/**
 * DB xatolik berganda uni zudlik bilan oflayn holatga o'tkazish
 */
export function markDbOffline() {
  dbAvailable = false;
  lastCheckTime = Date.now();
}

/**
 * DB mavjud bo'lsa so'rovni bajaradi, aks holda yoki xatolikda darhol fallback qaytaradi
 */
export async function withDbFallback<T>(
  dbQuery: () => Promise<T>,
  fallback: T | (() => Promise<T> | T)
): Promise<T> {
  const ok = await isDbAvailable();
  if (!ok) {
    return typeof fallback === "function" ? (fallback as any)() : fallback;
  }

  try {
    return await dbQuery();
  } catch (error) {
    markDbOffline();
    return typeof fallback === "function" ? (fallback as any)() : fallback;
  }
}
