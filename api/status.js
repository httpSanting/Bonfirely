const SERVER="https://bonfire-server.tail023236.ts.net";
const WINDOWS="https://github.com/httpSanting/Bonfirely/releases/latest/download/latest.yml";
const ANDROID="https://github.com/httpSanting/Bonfirely/releases/download/android-v0.2.0-alpha/android-alpha.json";
module.exports=async function handler(request,response){
 if(request.method!=="GET"){response.setHeader("Allow","GET");return response.status(405).json({message:"Método não permitido."});}
 response.setHeader("Cache-Control","public, s-maxage=180, stale-while-revalidate=300");
 response.setHeader("X-Content-Type-Options","nosniff");
 const read=async url=>{const result=await fetch(url,{signal:AbortSignal.timeout(3500)});if(!result.ok)throw Error("Unavailable");return result.text();};
 const [health,windows,android]=await Promise.allSettled([read(SERVER+"/healthz"),read(WINDOWS),read(ANDROID)]);
 const version=windows.status==="fulfilled"?windows.value.match(/^version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)/m)?.[1]||null:null;
 let androidVersion=null;
 if(android.status==="fulfilled")try{
  const manifest=JSON.parse(android.value.replace(/^\uFEFF/,""));
  if(manifest.channel==="alpha"&&manifest.packageId==="com.bonfirely.mobile"&&manifest.releaseSigned===true&&/^\d+\.\d+\.\d+-alpha(?:\.\d+)?$/.test(manifest.versionName))androidVersion=manifest.versionName;
 }catch{/* Availability of one platform never hides the other download. */}
 return response.status(200).json({online:health.status==="fulfilled"&&health.value.trim()==="ok",version,androidVersion,checkedAt:new Date().toISOString()});
};
