const SERVER="https://bonfire-server.tail023236.ts.net";
const WINDOWS="https://api.github.com/repos/httpSanting/Bonfirely/releases/latest";
// These fallbacks refer to releases whose public artifacts were verified.
const VERIFIED_WINDOWS="0.9.38",VERIFIED_ANDROID="0.3.0-alpha";
const ANDROID="https://api.github.com/repos/httpSanting/Bonfirely/releases?per_page=40";
module.exports=async function handler(request,response){
 if(request.method!=="GET"){response.setHeader("Allow","GET");return response.status(405).json({message:"Método não permitido."});}
 response.setHeader("Cache-Control","public, s-maxage=180, stale-while-revalidate=60");
 response.setHeader("X-Content-Type-Options","nosniff");
 const read=async url=>{const result=await fetch(url,{signal:AbortSignal.timeout(url===WINDOWS||url===ANDROID?6500:3500),headers:{Accept:url===WINDOWS||url===ANDROID?'application/vnd.github+json':'*/*'}});if(!result.ok)throw Error("Unavailable");return result.text();};
 const [health,windows,android]=await Promise.allSettled([read(SERVER+"/healthz"),read(WINDOWS),read(ANDROID)]);
 let version=VERIFIED_WINDOWS,androidVersion=VERIFIED_ANDROID;
 if(windows.status==="fulfilled")try{
  const release=JSON.parse(windows.value),candidate=/^v(\d+\.\d+\.\d+)$/.exec(release.tag_name)?.[1];
  const compare=(a,b)=>a.split('.').reduce((result,value,index)=>result||Number(value)-Number(b.split('.')[index]),0);
  if(candidate&&!release.draft&&!release.prerelease&&compare(candidate,VERIFIED_WINDOWS)>=0&&Array.isArray(release.assets)&&[`Bonfirely-Setup-${candidate}.exe`,`bonfirely-electron-${candidate}-x64.nsis.7z`,'latest.yml'].every(name=>release.assets.some(asset=>asset.name===name&&asset.state==='uploaded'&&asset.size>0)))version=candidate;
 }catch{/* A transient discovery failure must not replace a verified download. */}
 if(android.status==="fulfilled")try{
  const releases=JSON.parse(android.value);
  const parts=value=>value.replace(/-alpha\.?/,'.').split('.').map(Number);
  const compare=(a,b)=>{const left=parts(a),right=parts(b);for(let i=0;i<4;i++){const delta=(left[i]||0)-(right[i]||0);if(delta)return delta;}return 0;};
  if(Array.isArray(releases))for(const release of releases){
   const candidate=/^android-v(\d+\.\d+\.\d+-alpha(?:\.\d+)?)$/.exec(release.tag_name)?.[1];
   if(candidate&&!release.draft&&compare(candidate,androidVersion)>=0&&Array.isArray(release.assets)&&[`Bonfirely-Mobile-${candidate}.apk`,`Bonfirely-Mobile-${candidate}-SHA256SUMS.txt`,'android-alpha.json'].every(name=>release.assets.some(asset=>asset.name===name&&asset.state==='uploaded'&&asset.size>0)))androidVersion=candidate;
  }
 }catch{/* Availability of one platform never hides the other download. */}
 return response.status(200).json({online:health.status==="fulfilled"&&health.value.trim()==="ok",version,androidVersion,checkedAt:new Date().toISOString()});
};
