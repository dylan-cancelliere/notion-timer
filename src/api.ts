import type { Session } from "server/models";
const API_BASE = "https://notion-timer.uk.r.appspot.com";

export async function getLastSession(userId: string) {
  return fetch(`${API_BASE}/user/${userId}/lastSession`).then((res) => {
    if (!res.ok) throw new Error(res.status.toString());
    return res.json() as Promise<{ session: Session }>;
  });
}
