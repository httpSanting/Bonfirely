const ORIGIN = "https://github.com/httpSanting/Bonfirely/releases/download";
const nodes={light:document.querySelector("#status-light"),label:document.querySelector("#status-label"),detail:document.querySelector("#status-detail"),version:document.querySelector("#release-version"),android:document.querySelector("#android-version"),refresh:document.querySelector("#refresh-status")};
function updateDownloads(windows,android){
 const urls={};
 if(/^\d+\.\d+\.\d+$/.test(windows||"")){
  urls.installer=ORIGIN+"/v"+windows+"/Bonfirely-Setup-"+windows+".exe";
  urls.checksums=ORIGIN+"/v"+windows+"/Bonfirely-"+windows+"-SHA256SUMS.txt";
  nodes.version.textContent="Windows "+windows;
 }
 if(/^\d+\.\d+\.\d+-alpha(?:\.\d+)?$/.test(android||"")){
  urls.android=ORIGIN+"/android-v"+android+"/Bonfirely-Mobile-"+android+".apk";
  urls["android-checksums"]=ORIGIN+"/android-v"+android+"/Bonfirely-Mobile-"+android+"-SHA256SUMS.txt";
  urls["android-notes"]="https://github.com/httpSanting/Bonfirely/releases/tag/android-v"+android;
  nodes.android.textContent="Android "+android;
 }
 document.querySelectorAll("[data-download]").forEach(link=>{const url=urls[link.dataset.download];if(url)link.href=url;});
}
async function refreshStatus(){
 nodes.light.className="status-light checking";nodes.label.textContent="Verificando a conexão…";nodes.detail.textContent="Só um instante";nodes.refresh.disabled=true;
 try{
  const response=await fetch("/api/status",{cache:"no-store",signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw Error("Unavailable");
  const status=await response.json();
  nodes.light.className=status.online?"status-light online":"status-light offline";
  nodes.label.textContent=status.online?"Conexão disponível":"Conexão indisponível no momento";
  nodes.detail.textContent="Windows e Android continuam disponíveis para baixar.";
  updateDownloads(status.version,status.androidVersion);
 }catch{
  nodes.light.className="status-light offline";nodes.label.textContent="Não foi possível confirmar a conexão";
  nodes.detail.textContent="Os downloads oficiais continuam disponíveis. Tente verificar novamente.";
 }finally{nodes.refresh.disabled=false;}
}
nodes.refresh.addEventListener("click",refreshStatus);
document.querySelector("#year").textContent=new Date().getFullYear();
refreshStatus();
function localMessage(text){
 const message=document.createElement("article"),avatar=document.createElement("span"),body=document.createElement("div"),heading=document.createElement("p"),name=document.createElement("b"),content=document.createElement("p");
 avatar.className="avatar ava-you";avatar.textContent="V";name.textContent="Você";heading.append(name);content.textContent=text;body.append(heading,content);message.append(avatar,body);
 const history=document.querySelector("#demo-chat");history.append(message);while(history.children.length>80)history.firstElementChild.remove();history.scrollTop=history.scrollHeight;
}
document.querySelector("#demo-form").addEventListener("submit",event=>{
 event.preventDefault();const input=document.querySelector("#demo-message"),text=input.value.trim();if(!text)return;
 localMessage(text);input.value="";input.focus();
});
document.querySelector("#demo-call").addEventListener("click",event=>{
 const button=event.currentTarget,active=button.getAttribute("aria-pressed")!=="true";
 button.setAttribute("aria-pressed",String(active));button.textContent=active?"Sair":"Entrar";
 document.querySelector("#demo-call-state").textContent=active?"Você entrou na simulação":"Chamada simulada";
 localMessage(active?"Entrei na chamada demonstrativa. Nenhum áudio ou vídeo foi iniciado.":"Saí da chamada demonstrativa.");
});
