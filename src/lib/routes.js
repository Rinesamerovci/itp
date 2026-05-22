export const APP_BASE = "/vitakid";

export function buildAppPath(path = "") {
  if (!path || path === "/") {
    return APP_BASE;
  }

  return `${APP_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
