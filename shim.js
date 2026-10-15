// ตัวเชื่อมแอปกับ Supabase: ทำให้โค้ดหน้าจอใช้ db / user / downloads ได้เหมือนเดิม
(function(){
  const cfg=window.OPS_CONFIG||{},gate=document.getElementById("gate"),msg=document.getElementById("gate-msg");
  const configured=cfg.url&&!/YOUR-PROJECT/.test(cfg.url);
  let sb=null,session=null,resolveReady;const ready=new Promise(r=>resolveReady=r);
  const showGate=t=>{gate.hidden=false;if(t)msg.textContent=t};
  if(!configured){showGate("ยังไม่ได้ตั้งค่า config.js (ดู README)")}
  else{
    sb=window.supabase.createClient(cfg.url,cfg.anonKey);
    sb.auth.onAuthStateChange((ev,s)=>{session=s;if(s){gate.hidden=true;resolveReady(s)}else showGate()});
    sb.auth.getSession().then(({data})=>{if(!data.session)showGate()});
    document.getElementById("gate-form").addEventListener("submit",async e=>{
      e.preventDefault();msg.textContent="กำลังส่ง…";
      const {error}=await sb.auth.signInWithOtp({email:document.getElementById("gate-email").value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});
      msg.textContent=error?"ส่งไม่สำเร็จ: "+error.message:"ส่งลิงก์แล้ว เปิดอีเมลแล้วกดลิงก์เพื่อเข้าสู่ระบบ";
    });
  }
  const T="docs",listeners=new Set();let tm=0;
  const refresh=()=>{clearTimeout(tm);tm=setTimeout(()=>listeners.forEach(l=>l()),80)};
  let chan=null;
  const ensureChan=()=>{if(chan||!sb)return;chan=sb.channel("docs-live").on("postgres_changes",{event:"*",schema:"public",table:T},refresh).subscribe()};
  const fail=e=>{throw {code:(e&&e.code==="42501")?"invalid_argument":"error",message:e&&e.message}};
  function collection(c){
    let ob=null,lim=null;
    const q={
      orderBy(f,d){ob=[f,d||"asc"];return q},
      limit(n){lim=n;return q},
      onSnapshot(ok,err){
        ensureChan();
        const load=async()=>{
          const {data,error}=await sb.from(T).select("id,data").eq("collection",c);
          if(error){err&&err({code:"error"});return}
          let rows=data.map(r=>({id:r.id,v:r.data}));
          if(ob)rows.sort((a,b)=>{const x=a.v[ob[0]],y=b.v[ob[0]];return (x>y?1:x<y?-1:0)*(ob[1]==="desc"?-1:1)});
          if(lim)rows=rows.slice(0,lim);
          ok({docs:rows.map(r=>({id:r.id,data:()=>r.v}))});
        };
        listeners.add(load);load();return()=>listeners.delete(load);
      },
      async add(d){const id=crypto.randomUUID();const {error}=await sb.from(T).upsert({collection:c,id,data:d});if(error)fail(error);refresh();return{id}}
    };
    return q;
  }
  function doc(path){
    const [c,id]=path.split("/");
    return{
      async set(d){const {error}=await sb.from(T).upsert({collection:c,id,data:d});if(error)fail(error);refresh()},
      async update(p){
        const {data,error}=await sb.from(T).select("data").eq("collection",c).eq("id",id).maybeSingle();
        if(error)fail(error);if(!data)throw{code:"not_found"};
        const {error:e2}=await sb.from(T).upsert({collection:c,id,data:Object.assign({},data.data,p)});if(e2)fail(e2);refresh();
      },
      async delete(){const {error}=await sb.from(T).delete().eq("collection",c).eq("id",id);if(error)fail(error);refresh()}
    };
  }
  const dbApi={collection,doc};
  const userApi={can:async()=>true,id:async()=>session&&session.user.id,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:"MA"}]))};
  const dlApi={async save({filename,data}){
    const ext=(filename.split(".").pop()||"").toLowerCase(),types={csv:"text/csv;charset=utf-8",png:"image/png",json:"application/json"};
    const blob=data instanceof Blob?data:new Blob([data],{type:types[ext]||"application/octet-stream"});
    const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
    return{status:"saved"};
  }};
  window.claude={use:async n=>{
    if(n==="downloads")return dlApi;
    if(!configured)return new Promise(()=>{});
    await ready;
    return n==="db"?dbApi:n==="user"?userApi:null;
  }};
})();
