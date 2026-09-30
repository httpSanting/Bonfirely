const SERVER = "https://bonfire-server.tail023236.ts.net";
const RELEASE = "https://github.com/httpSanting/Bonfirely/releases/latest/download/latest.yml";
module.exports = async function handler(_request, response) {
  response.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  const read = async url => {
    const res = await fetch(url, {signal: AbortSignal.timeout(3500)});
    if (!res.ok) throw new Error("Unavailable");
    return res.text();
  };
  const [health, manifest] = await Promise.allSettled([read(SERVER + "/healthz"), read(RELEASE)]);
  const online = health.status === "fulfilled" && health.value.trim() === "ok";
  const version = manifest.status === "fulfilled" ? manifest.value.match(/^version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)/m)?.[1] || null : null;
  response.status(200).json({online,version,checkedAt:new Date().toISOString()});
};
