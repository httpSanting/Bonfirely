const DOWNLOAD_ORIGIN = "https://github.com/httpSanting/Bonfirely/releases/download";
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
    installer: `${DOWNLOAD_ORIGIN}/v${version}/Bonfirely-Setup-${version}.exe`,
    checksums: `${DOWNLOAD_ORIGIN}/v${version}/Bonfirely-${version}-SHA256SUMS.txt`,
  };
  document.querySelectorAll("[data-download]").forEach(link => {
    const url = urls[link.dataset.download];
    if (url) link.href = url;
  });
  nodes.version.textContent = `Versão ${version}`;
};

async function refreshStatus() {
  nodes.light.className = "status-light checking";
  nodes.label.textContent = "Verificando a conexão…";
  nodes.detail.textContent = "Só um instante";
  nodes.refresh.disabled = true;
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const status = await response.json();
    nodes.light.className = status.online ? "status-light online" : "status-light offline";
    nodes.label.textContent = status.online ? "Conexão disponível" : "Conexão indisponível no momento";
    nodes.detail.textContent = "Os downloads continuam disponíveis.";
    if (status.version) updateDownloads(status.version);
  } catch {
    nodes.light.className = "status-light offline";
    nodes.label.textContent = "Não foi possível confirmar a conexão";
    nodes.detail.textContent = "O download continua disponível; tente novamente em instantes";
  } finally {
    nodes.refresh.disabled = false;
  }
}

nodes.refresh.addEventListener("click", refreshStatus);
document.querySelector("#year").textContent = new Date().getFullYear();
refreshStatus();

// A local-only demonstration. No messages are sent to any service or retained.
document.querySelector('#demo-form').addEventListener('submit', event => {
  event.preventDefault();
  const input=document.querySelector('#demo-message'), text=input.value.trim();
  if(!text)return;
  const message=document.createElement('article'), avatar=document.createElement('span');
  avatar.className='avatar ava-you';avatar.textContent='V';
  const body=document.createElement('div'),heading=document.createElement('p'),name=document.createElement('b'),content=document.createElement('p');
  name.textContent='Você';heading.append(name);content.textContent=text;body.append(heading,content);message.append(avatar,body);
  const history=document.querySelector('#demo-chat');history.append(message);while(history.children.length>80)history.firstElementChild.remove();
  input.value='';history.scrollTop=history.scrollHeight;input.focus();
});
