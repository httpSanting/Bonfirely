const SERVER = "https://bonfire-server.tail023236.ts.net";

module.exports = async function handler(_request, response) {
  response.setHeader("Cache-Control", "public, s-maxage=45, stale-while-revalidate=120");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const [health, manifest] = await Promise.all([
      fetch(`${SERVER}/healthz`, { signal: AbortSignal.timeout(3500) }),
      fetch(`${SERVER}/updates/latest.yml`, { signal: AbortSignal.timeout(3500) }),
    ]);
    const healthText = await health.text();
    const manifestText = await manifest.text();
    const version = manifestText.match(/^version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)/m)?.[1] || null;
    const online = health.ok && healthText.trim() === "ok";
    response.status(online ? 200 : 503).json({ online, version, checkedAt: new Date().toISOString() });
  } catch {
    response.status(503).json({ online: false, version: null, checkedAt: new Date().toISOString() });
  }
};
