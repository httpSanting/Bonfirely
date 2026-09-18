const DOWNLOAD_ORIGIN = "https://bonfire-server.tail023236.ts.net/downloads";
const nodes = {
  light: document.querySelector("#status-light"),
  label: document.querySelector("#status-label"),
  detail: document.querySelector("#status-detail"),
  version: document.querySelector("#release-version"),
  refresh: document.querySelector("#refresh-status"),
};

const updateDownloads = (version) => {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return;
  const urls = {
    installer: `${DOWNLOAD_ORIGIN}/Bonfirely-Setup-${version}.exe`,
    portable: `${DOWNLOAD_ORIGIN}/Bonfirely-portable-${version}.exe`,
    checksums: `${DOWNLOAD_ORIGIN}/Bonfirely-${version}-SHA256SUMS.txt`,
  };
  document.querySelectorAll("[data-download]").forEach(link => {
    const url = urls[link.dataset.download];
    if (url) link.href = url;
  });
  nodes.version.textContent = `Versão ${version}`;
};

async function refreshStatus() {
  nodes.light.className = "status-light checking";
  nodes.label.textContent = "Verificando o servidor…";
  nodes.detail.textContent = "Conectando à infraestrutura Bonfirely";
  nodes.refresh.disabled = true;
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const status = await response.json();
    if (!status.online) throw new Error("Servidor indisponível");
    nodes.light.className = "status-light online";
    nodes.label.textContent = "Todos os sistemas operacionais";
    nodes.detail.textContent = status.version ? `Servidor online · versão ${status.version}` : "Servidor online";
    if (status.version) updateDownloads(status.version);
  } catch {
    nodes.light.className = "status-light offline";
    nodes.label.textContent = "Não foi possível confirmar o servidor";
    nodes.detail.textContent = "O download continua disponível; tente novamente em instantes";
  } finally {
    nodes.refresh.disabled = false;
  }
}

nodes.refresh.addEventListener("click", refreshStatus);
document.querySelector("#year").textContent = new Date().getFullYear();
refreshStatus();
