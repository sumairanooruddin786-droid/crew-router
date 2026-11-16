const $ = (id) => document.getElementById(id);
const btn = $("askBtn"), qEl = $("query"), out = $("out");
let history = JSON.parse(localStorage.getItem("router_history") || "[]");

function esc(s){return s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}
function clean(t){
  return t
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\\boxed\{([^}]*)\}/g, "$1")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/^\s*-{3,}\s*$/gm, "");
}
function md(text){
    const lines = esc(clean(text)).split("\n"); let html="", inList=false;
  for (let l of lines){
    l = l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`(.+?)`/g,"<code>$1</code>");
    if (/^\s*[-*]\s+/.test(l)){ if(!inList){html+="<ul>";inList=true;} html+="<li>"+l.replace(/^\s*[-*]\s+/,"")+"</li>"; }
    else { if(inList){html+="</ul>";inList=false;} if(l.trim()) html+="<p>"+l.replace(/^#+\s*/,"")+"</p>"; }
  }
  return html + (inList?"</ul>":"");
}

function setBoard(state, cat){
  const set=(n,s,t,on)=>{ $("n"+n).classList.toggle("active",on); $("s"+n).textContent=t; };
  $("wireMath").setAttribute("class",""); $("wireTeach").setAttribute("class","");
  if(state==="routing"){ set("Router","",  "Reading your question…",true); set("Math","","Idle",false); set("Teach","","Idle",false); }
  else if(state==="done"){
    set("Router","","Routed to "+(cat==="MATH"?"Math Expert":"Teacher"),false);
    set("Math","",cat==="MATH"?"Answered":"Idle",cat==="MATH");
    set("Teach","",cat==="EXPLAIN"?"Answered":"Idle",cat==="EXPLAIN");
    $(cat==="MATH"?"wireMath":"wireTeach").setAttribute("class",cat==="MATH"?"on-math":"on-teach");
  } else { set("Router","","Waiting",false); set("Math","","Idle",false); set("Teach","","Idle",false); }
}

function renderHistory(){
  $("histWrap").classList.toggle("hidden", history.length===0);
  $("hist").innerHTML = history.map((h,i)=>`<li data-i="${i}"><span class="dot ${h.category}"></span>${esc(h.query)}</li>`).join("");
}

function show(r){
  out.classList.remove("hidden");
  $("badge").className="badge "+r.category; $("badge").textContent=r.category==="MATH"?"Math":"Explanation";
  $("who").textContent="Answered by "+r.agent;
  $("answer").className="answer"; $("answer").innerHTML=md(r.answer);
  setBoard("done", r.category);
}

async function ask(){
  const query = qEl.value.trim();
  if(!query){ qEl.focus(); return; }
  btn.disabled=true; btn.textContent="Routing…"; setBoard("routing");
  try{
    const res = await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.detail||"Request failed");
    show(data);
    history.unshift({query,...data}); history=history.slice(0,10);
    localStorage.setItem("router_history",JSON.stringify(history)); renderHistory();
  }catch(e){
    out.classList.remove("hidden");
    $("badge").className="badge error"; $("badge").textContent="Error"; $("who").textContent="";
    $("answer").className="answer err";
    $("answer").textContent="Could not get an answer: "+e.message+". Check that the server is running and GROQ_API_KEY is set in backend/.env.";
    setBoard("idle");
  }finally{ btn.disabled=false; btn.textContent="Send to router"; }
}

btn.addEventListener("click",ask);
qEl.addEventListener("keydown",e=>{ if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) ask(); });
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{qEl.value=c.dataset.q;qEl.focus();}));
$("hist").addEventListener("click",e=>{const li=e.target.closest("li"); if(li){const h=history[+li.dataset.i]; qEl.value=h.query; show(h);}});
$("clear").addEventListener("click",()=>{history=[];localStorage.removeItem("router_history");renderHistory();});
renderHistory();
