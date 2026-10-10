"use strict";
const SERVER = "https://bonfire-server.tail023236.ts.net";
const RELEASES = "https://api.github.com/repos/httpSanting/Bonfirely/releases?per_page=40";
// Update only after the public installers and manifests have been verified.
const VERIFIED_WINDOWS = "0.9.43", VERIFIED_ANDROID = "0.4.0-alpha";
let snapshot, expiresAt = 0, pending;
function greater(a, b) {
  const left = a.replace(/-alpha\.?/, ".").split(".").map(Number);
  const right = b.replace(/-alpha\.?/, ".").split(".").map(Number);
  for (let i = 0; i < 4; i++) { const delta = (left[i] || 0) - (right[i] || 0); if (delta) return delta > 0; }
  return false;
}
function complete(release, names) {
  return !release.draft && Array.isArray(release.assets) && names.every(name =>
    release.assets.some(asset => asset.name === name && asset.state === "uploaded" && asset.size > 0));
}
async function read(url, timeout) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw Error("Service unavailable");
  const content = await response.text();
  if (content.length > 2_097_152) throw Error("Unexpected response size");
  return content;
}
async function probe() {
  // One public release request serves both platforms; shared concurrent probes
  // and the CDN cache reduce free-tier consumption without polling clients.
  const [health, releases] = await Promise.allSettled([read(SERVER + "/healthz", 3500), read(RELEASES, 5000)]);
  let version = VERIFIED_WINDOWS, androidVersion = VERIFIED_ANDROID;
  if (releases.status === "fulfilled") try {
    const list = JSON.parse(releases.value);
    if (Array.isArray(list)) for (const release of list) {
      const windows = /^v(\d+\.\d+\.\d+)$/.exec(release.tag_name)?.[1];
      if (windows && !release.prerelease && greater(windows, version) && complete(release,
        [`Bonfirely-Setup-${windows}.exe`, `bonfirely-electron-${windows}-x64.nsis.7z`, "latest.yml"])) version = windows;
      const android = /^android-v(\d+\.\d+\.\d+-alpha(?:\.\d+)?)$/.exec(release.tag_name)?.[1];
      if (android && greater(android, androidVersion) && complete(release,
        [`Bonfirely-Mobile-${android}.apk`, `Bonfirely-Mobile-${android}-SHA256SUMS.txt`, "android-alpha.json"])) androidVersion = android;
    }
  } catch { /* A discovery failure keeps the reviewed public downloads. */ }
  return { online: health.status === "fulfilled" && health.value.trim() === "ok", version, androidVersion, checkedAt: new Date().toISOString() };
}
module.exports = async function handler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET"); response.setHeader("Cache-Control", "no-store");
    return response.status(405).json({ message: "Método não permitido." });
  }
  response.setHeader("Cache-Control", "public, max-age=30, s-maxage=180, stale-while-revalidate=60");
  if (!snapshot || Date.now() >= expiresAt) {
    pending ||= probe().then(value => { snapshot = value; expiresAt = Date.now() + 30_000; return value; }).finally(() => { pending = null; });
    await pending;
  }
  return response.status(200).json(snapshot);
};
