const API_BASE = "https://notion-timer.uk.r.appspot.com";

export async function getLastSession(userId: string) {
  const res = await fetch(`${API_BASE}/user/${userId}/lastSession`);
  const data = await res.json();
  console.log("RES", data);
}
