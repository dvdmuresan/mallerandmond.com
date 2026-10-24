/* ---------------- data ---------------- */
/* project data lives in js/projects.js */
/* work mosaic: two packed columns; [project index, aspect] or {pair:[[i,ar],[i,ar]]} = two small pieces on a grey ground */
const W = {
  cols:[[[0,"4/5"],[3,"1/1"],[5,"4/5"]],[[2,"4/5"],[7,"4/5"],[8,"1/1"]],[[6,"16/9"],[1,"1/1"],[4,"4/5"]]]
};
/* project mosaic: two packed columns of different heights, plus a full-width closer.
   Strings are aspect ratios; {pair} = two small pieces set on a grey ground. */
const S = {
  left:["16/9","16/9",{pair:["4/5","4/5"]},"4/5"],
  right:["5/6","3/2","4/5","16/10"],
  full:"21/9"
};

const SN={"Maller":"STUDIO MALLER","Mond":"MOND : STUDIO","Maller & Mond":"STUDIO MALLER × MOND : STUDIO"};
/* Let the browser choose an existing thumbnail, a 960px copy, or the original. */
const thumbPath=src=>src.replace(/\/([^/]+)\.(?:jpg|webp)$/, "/thumbs/$1.jpg");
function imageAttrs(src,sizes,eager=false){
  const info=IMAGES[src];
  const sources=info?[info.thumb,info.medium,{src,w:info.w}].filter(Boolean):[];
  return `src="${src}"${info?` width="${info.w}" height="${info.h}" srcset="${sources.map(s=>`${s.src} ${s.w}w`).join(",")}" sizes="${sizes}"`:""} decoding="async" loading="${eager?"eager":"lazy"}"${eager?' fetchpriority="high"':""}`;
}
const WORK_SIZES="(max-width: 700px) calc(100vw - 32px), calc((100vw - 60px) / 3)";
/* Videos fetch only near the viewport and play only while visible. */
const autoVideo=!matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;
let videoLoader,videoPlayer;
function playVideo(video){
  if(autoVideo&&!document.hidden&&!document.body.classList.contains("transitioning")&&video.dataset.visible==="true")video.play().catch(()=>{});
}
function syncMedia(view){
  videoLoader?.disconnect();videoPlayer?.disconnect();
  document.querySelectorAll("video").forEach(v=>{v.pause();delete v.dataset.visible});
  const videos=[...view.querySelectorAll("video")];
  const load=v=>{
    if(v.dataset.poster)v.poster=v.dataset.poster;
    if(!v.getAttribute("src")){
      v.src=v.dataset.src;v.preload=autoVideo?"metadata":"none";
      if(autoVideo)v.load();
    }
  };
  if(!("IntersectionObserver" in window)){
    videos.forEach(v=>{load(v);v.controls=true});return;
  }
  videoLoader=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(isIntersecting){load(target);videoLoader.unobserve(target)}
  }),{rootMargin:"400px 0px"});
  videoPlayer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    target.dataset.visible=String(isIntersecting);
    if(isIntersecting){load(target);playVideo(target)}else target.pause();
  }),{threshold:.05});
  videos.forEach(v=>{v.controls=!autoVideo;videoLoader.observe(v);videoPlayer.observe(v)});
}
document.addEventListener("visibilitychange",()=>document.querySelectorAll("video").forEach(v=>{
  if(document.hidden)v.pause();else playVideo(v);
}));
/* ---------------- placeholder generator ---------------- */
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function hash(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function ratio(ar){const [a,b]=ar.split("/").map(Number);return a/b}
const cache=new Map();
/* real cover if the project has one, otherwise a generated placeholder */
const coverSrc=(i,ar,kind,w)=>P[i].cover||art(P[i].slug+"-cover",ar,P[i].pal,P[i].title,kind,w);
function art(key,ar,pal,label,kindHint,W=1100){
  const k=key+ar+W; if(cache.has(k)) return cache.get(k);
  const H=Math.round(W/ratio(ar));
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const g=c.getContext("2d"),r=rng(hash(key+ar));
  const [bg,fg,ac]=pal;
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  const kind=kindHint ?? Math.floor(r()*5);
  const M=Math.min(W,H);
  const sans=(w,s)=>`${w} ${s}px "Suisse BP Intl", "Helvetica Neue", Arial, sans-serif`;
  const serif=s=>sans(600,s);
  if(kind===0){
    let ph=H*.78, pw=ph/1.414; if(pw>W*.6){pw=W*.6;ph=pw*1.414}
    const x=(W-pw)/2+(r()-.5)*W*.12, y=(H-ph)/2;
    g.save();g.shadowColor="rgba(0,0,0,.25)";g.shadowBlur=W*.035;g.shadowOffsetY=W*.016;
    g.fillStyle=fg;g.fillRect(x,y,pw,ph);g.restore();
    g.fillStyle=ac;g.beginPath();g.arc(x+pw*(.3+r()*.4),y+ph*.42,pw*.32,0,7);g.fill();
    g.fillStyle=bg;g.font=sans(600,pw*.13);g.fillText(label.split(" ")[0],x+pw*.07,y+ph*.9,pw*.86);
    g.font=serif(pw*.05);g.fillText("2026, Cluj-Napoca",x+pw*.07,y+ph*.1);
  } else if(kind===1){
    let yy=0;while(yy<H){const h=H*(.04+r()*.16);g.fillStyle=r()>.55?ac:(r()>.5?fg:bg);g.fillRect(0,yy,W,h);yy+=h+H*.02}
    g.fillStyle=fg;g.fillRect(W*.06,H*.32,W*.88,H*.36);
    g.fillStyle=bg;g.font=sans(600,Math.min(H*.2,W*.12));g.fillText(label,W*.1,H*.58,W*.8);
  } else if(kind===2){
    const n=8+Math.floor(r()*6),cell=W/n;
    for(let i=0;i<n;i++)for(let j=0;j*cell<H+cell;j++){
      const v=r();g.fillStyle=v>.82?ac:fg;g.beginPath();
      g.arc(i*cell+cell/2,j*cell+cell/2,cell*(v>.82?.42:.12+v*.18),0,7);g.fill();}
  } else if(kind===3){
    g.fillStyle=fg;g.font=sans(600,M*1.05);g.textAlign="center";
    g.fillText(label[0],W*.52,H*.5+M*.38);
    g.textAlign="left";g.fillStyle=ac;g.fillRect(W*.06,H*.08,M*.14,M*.14);
    g.fillStyle=fg;g.font=serif(M*.05);g.fillText(label,W*.06,H*.94);
  } else {
    for(let i=0;i<4;i++){
      const cw=M*(.42+r()*.12),ch=cw*.58,x=W*(.18+r()*.5)-cw/2+W*.1,y=H*(.2+r()*.55)-ch/2;
      g.save();g.translate(x+cw/2,y+ch/2);g.rotate((r()-.5)*.6);
      g.shadowColor="rgba(0,0,0,.22)";g.shadowBlur=W*.022;g.shadowOffsetY=W*.01;
      g.fillStyle=[fg,ac,"#ffffff",fg][i];g.fillRect(-cw/2,-ch/2,cw,ch);g.shadowColor="transparent";
      g.fillStyle=i===0||i===3?bg:fg;g.font=sans(600,ch*.16);g.fillText(label,-cw/2+ch*.12,ch/2-ch*.14,cw*.85);
      g.restore();}
  }
  const N=Math.round(W*H/90);for(let i=0;i<N;i++){g.fillStyle=r()>.5?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)";g.fillRect(r()*W,r()*H,1.4,1.4)}
  const url=c.toDataURL("image/jpeg",.82);cache.set(k,url);return url;
}

/* ---------------- home: all projects spread out; hover paints the page in the project's colour ---------------- */
const field=document.getElementById("field"),hoverline=document.getElementById("hoverline"),defaultLine=hoverline.textContent;
const bgs=[document.getElementById("bgA"),document.getElementById("bgB")];let bgi=0,homeI=-1;
const HR=["4/5","3/2","1/1","5/4","1/1","4/5","4/5","3/2","3/2","1/1","3/2","4/5","3/2","1/1","4/5","4/5","1/1","5/4"];
const thumbSrc=i=>P[i].cover||art(P[i].slug+"-thumb",HR[i%HR.length],P[i].pal,P[i].title,(i*3)%5,520);
/* black or white text, whichever contrasts more with a colour (switch point ≈ 0.18 relative luminance) */
function isDark(hex){const n=parseInt(hex.slice(1),16),f=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
  return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255)<.18}
function paintHome(color){const nb=bgs[bgi^1];nb.style.backgroundColor=color;nb.classList.add("on");bgs[bgi].classList.remove("on");bgi^=1;
  document.body.classList.toggle("on-dark",!color||isDark(color))}
/* projects still in progress: edit this list (shown under "Working on right now" at the bottom of Work and About) */
const CLIENTS=[["Marty Restaurants","Romania"],["Liszt Ferenc Music Academy","Budapest"],["Olivo Bistro","Romania"],["House of Music","Budapest"],["Olivo Coffee Culture","Romania"],["Narcoffee","Romania"],["GoHome","Netherlands"],["Hirsch-Porozel","Romania"]];
const NOW=[["Ia loc","Romania"],["IOTA Association","Romania"],["Megamontaj","Romania"],["Fufu Bakerhouse","Netherlands"]];
const li=([n,w])=>`<li>${n}, <span class="hl-where">${w}</span></li>`;
function renderLists(){
  document.querySelectorAll(".hl-projects").forEach(pl=>pl.innerHTML=CLIENTS.map(li).join(""));
  document.querySelectorAll(".hl-now").forEach(nl=>nl.innerHTML=NOW.map(li).join(""));
}
function setHome(i){
  if(i===homeI)return;homeI=i;
  if(i<0){hoverline.textContent=defaultLine;return}
  hoverline.textContent=P[i].title;
}
function renderHome(){
  /* one frosted strip with every project; hovering one swaps the dimmed background image and the text below */
  const short=t=>{t=(t||"").replace(/\s+/g," ").trim();if(t.length<=220)return t;const c=t.slice(0,220);return c.slice(0,c.lastIndexOf(" "))+"…"};
  const big=i=>P[i].coverPoster||P[i].cover||thumbSrc(i);
  field.innerHTML=P.slice(0,6).map((p,i)=>`<a class="tile" href="#${p.slug}" data-route="${p.slug}" data-i="${i}" aria-label="${p.title}"><img alt="" src="${thumbPath(p.coverPoster||p.cover||thumbSrc(i))}" decoding="async" draggable="false"></a>`).join("");
  const show=i=>{
    if(i===homeI)return;homeI=i;
    const nb=bgs[bgi^1];nb.style.backgroundImage=`url("${big(i)}")`;nb.classList.add("on");bgs[bgi].classList.remove("on");bgi^=1;
    document.getElementById("hiTitle").textContent=P[i].title;
    document.getElementById("hiYear").textContent=P[i].year||"";
    document.getElementById("hiDesc").textContent=short(P[i].desc);
    [...field.children].forEach(a=>a.classList.toggle("on",+a.dataset.i===i));
  };
  const pick=e=>{const a=e.target.closest(".tile");if(a)show(+a.dataset.i)};
  field.onmouseover=pick;field.onfocusin=pick;field.onmouseleave=null;
  document.body.classList.add("on-dark");
  homeI=-1;show(Math.floor(Math.random()*Math.min(6,P.length)));
}

/* ---------------- work ---------------- */
const grid=document.getElementById("grid");
function renderGrid(){
  const card=([i,ar],w,eager=false)=>{const p=P[i];
    return `<a class="card" href="#${p.slug}" data-route="${p.slug}" data-studio="${p.studio}" style="--ar:${ar}">
      <div class="img">${p.coverVideo?`<video data-src="${p.coverVideo}" data-poster="${p.coverPoster||coverSrc(i,ar,i%5,w)}" muted loop playsinline preload="none" aria-label="${p.title}"></video>`:`<img alt="${p.title}" ${imageAttrs(coverSrc(i,ar,i%5,w),WORK_SIZES,eager)}>`}</div>
      <div class="cap"><span class="t">${p.title}</span><span class="s">${p.services}</span></div>
    </a>`};
  const col=list=>`<div class="gcol">${list.map((x,n)=>x.pair?`<div class="gpair">${x.pair.map(c=>card(c,520)).join("")}</div>`:card(x,undefined,n===0)).join("")}</div>`;
  grid.innerHTML=W.cols.map(col).join("");
}

/* ---------------- project ---------------- */
/* real media: landscape pieces run full width; portraits between them are split into two balanced columns */
function mediaEl(m,n,title){
  const sizes=m.w/m.h>1.25?"(max-width: 900px) calc(100vw - 32px), calc(70vw - 38px)":"(max-width: 700px) calc(100vw - 32px), (max-width: 900px) calc((100vw - 42px) / 2), calc((70vw - 48px) / 2)";
  return m.video?`<figure class="shot" style="--ar:${m.w}/${m.h}"><video data-src="${m.src}"${m.poster?` data-poster="${m.poster}"`:""} width="${m.w}" height="${m.h}" muted loop playsinline preload="none" aria-label="${title}, video ${n}"></video></figure>`
    :`<figure class="shot" style="--ar:${m.w}/${m.h}"><img ${imageAttrs(m.src,sizes,n<=2)} alt="${title}, image ${n}"></figure>`;
}
function realShots(p){
  let out="",run=[],n=0;
  const solo=x=>`<div class="full solo">${x.el}</div>`;
  const flush=()=>{if(!run.length)return;const c=[[],[]],h=[0,0];
    const last=run.length%2?run.pop():null;
    run.forEach(x=>{const k=h[0]<=h[1]?0:1;c[k].push(x.el);h[k]+=x.m.h/x.m.w});
    if(run.length)out+=c.map(col=>`<div class="mcol">${col.join("")}</div>`).join("");if(last)out+=solo(last);run=[]};
  p.media.forEach(m=>{n++;const el=mediaEl(m,n,p.title);if(m.w/m.h>1.25){flush();out+=`<div class="full">${el}</div>`}else run.push({m,el})});
  flush();return out;
}
const vp=document.getElementById("v-project");
function renderProject(p){
  const i=P.indexOf(p),prev=P[(i-1+P.length)%P.length],next=P[(i+1)%P.length];
  let j=0;
  const pal=()=>j%2?[p.pal[1],p.pal[0],p.pal[2]]:p.pal;
  const fig=(ar,w)=>{j++;return `<figure class="shot" style="--ar:${ar}"><img alt="${p.title}, image ${j} (placeholder)" src="${art(p.slug+"-"+j,ar,pal(),p.title,undefined,w)}"></figure>`};
  const col=list=>`<div class="mcol">${list.map(x=>typeof x==="string"?fig(x):`<div class="pair box">${x.pair.map(a=>fig(a,520)).join("")}</div>`).join("")}</div>`;
  const shots=p.media?realShots(p):col(S.left)+col(S.right)+`<div class="full">${fig(S.full,1600)}</div>`;
  vp.innerHTML=`<div class="project">
    <aside class="info${isDark(p.pal[0])?" dark":""}" id="pinfo" style="--pc:${p.pal[0]}">
      <div class="itop"><a class="ibtn" href="#work" data-route="work">← All work</a><a class="ibtn" href="#contact" data-route="contact">Get in touch</a></div>
      <dl class="ihead">
        <div><dt>Project</dt><dd>${p.title}</dd></div>
        <div><dt>Year</dt><dd>${p.year}</dd></div>
        ${p.category?`<div><dt>Category</dt><dd>${p.category}</dd></div>`:""}
        <div><dt>Services</dt><dd>${p.services}</dd></div>
        ${p.location?`<div><dt>Location</dt><dd>${p.location}</dd></div>`:""}
        ${p.client?`<div><dt>Client</dt><dd>${p.client}</dd></div>`:""}
        <div><dt>Studio</dt><dd>${SN[p.studio]}</dd></div>
        ${p.team?`<div><dt>Team</dt><dd>${p.team}</dd></div>`:""}
      </dl>
      <div class="ibody">
        ${p.approach?`<span class="dlbl">Project</span>`:""}<p class="desc">${p.desc}</p>${p.approach?`<span class="dlbl">Approach</span><p class="desc">${p.approach}</p>`:""}
        <button class="ibtn" type="button" aria-expanded="false" aria-label="Show full description" onclick="const i=document.getElementById('pinfo');const o=i.classList.toggle('open');this.textContent=o?'−':'+';this.setAttribute('aria-expanded',o)">+</button>
      </div>
      <div class="pager"><a class="ibtn" href="#${prev.slug}" data-route="${prev.slug}">‹ ${prev.title}</a><a class="ibtn" href="#${next.slug}" data-route="${next.slug}">${next.title} ›</a></div>
    </aside>
    <div class="shots">${shots}</div>
  </div>
  <a class="next" href="#${next.slug}" data-route="${next.slug}"><span>Next project</span><b>${next.title} →</b></a>`;
}

/* ---------------- routing + curtain ---------------- */
const curtain=document.getElementById("curtain");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let current=null,busy=false,queuedRoute=null;
const renderedViews=new Set();
function show(route){
  const p=P.find(x=>x.slug===route);
  const key=p?"project":(["work","about","contact"].includes(route)?route:"home");
  if(!renderedViews.has(key)){
    if(key==="home")renderHome();
    if(key==="work")renderGrid();
    renderedViews.add(key);
  }
  document.body.dataset.view=key;
  document.querySelectorAll(".view").forEach(v=>v.hidden=v.id!=="v-"+key);
  if(p&&vp.dataset.project!==p.slug){renderProject(p);vp.dataset.project=p.slug}
  document.querySelectorAll(".nav a").forEach(a=>{const on=a.dataset.route===(p?"work":key);on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  document.title=p?`${p.title} — STUDIO MALLER & MOND : STUDIO`:"STUDIO MALLER & MOND : STUDIO";
  document.getElementById("toplogo").style.visibility=key==="home"?"hidden":"visible";
  window.scrollTo(0,0);current=route||"home";
  syncMedia(document.getElementById("v-"+key));
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const painted=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
/* Switch views only once the curtain has actually stopped, even on a busy frame. */
function moveCurtain(change){
  return new Promise(resolve=>{
    let timer;
    const finish=()=>{
      clearTimeout(timer);
      curtain.removeEventListener("transitionend",ended);
      curtain.removeEventListener("transitioncancel",ended);
      resolve();
    };
    const ended=e=>{if(e.target===curtain&&e.propertyName==="transform")finish()};
    curtain.addEventListener("transitionend",ended);
    curtain.addEventListener("transitioncancel",ended);
    change();
    const style=getComputedStyle(curtain);
    const seconds=value=>value.endsWith("ms")?parseFloat(value)/1000:parseFloat(value);
    const durations=style.transitionDuration.split(",").map(seconds);
    const delays=style.transitionDelay.split(",").map(seconds);
    const duration=Math.max(...durations.map((d,i)=>d+delays[i%delays.length]));
    /* A hidden tab or disabled transition may never dispatch transitionend. */
    timer=setTimeout(finish,duration*1000+150);
  });
}
async function prepareReveal(){
  await painted();
  const view=document.querySelector(".view:not([hidden])");
  const images=[...view.querySelectorAll("img")].filter(img=>{
    const r=img.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;
  });
  const ready=images.map(img=>{
    img.loading="eager";
    return img.decode?img.decode().catch(()=>{}):Promise.resolve();
  });
  /* Give visible images a chance to decode without holding up slow connections. */
  await Promise.race([Promise.all(ready),wait(200)]);
  await painted();
}
function finishTransition(){
  document.body.classList.remove("transitioning");
  document.querySelectorAll("video").forEach(playVideo);
}
const CUR={home:["var(--c-yellow)","#111"],work:["var(--c-maroon)","var(--c-blush)"],project:["var(--c-maroon)","var(--c-blush)"],about:["var(--c-red)","#111"],contact:["var(--c-yellow)","#111"]};
function viewOf(route){return P.find(x=>x.slug===route)?"project":(["work","about","contact"].includes(route)?route:"home")}
/* transition palettes: background + logo colour; a different one each time */
const COMBOS=[["#c8c5fb","#291811"],["#ea4c27","#b49d84"],["#291811","#c8c5fb"],["#b49d84","#ea4c27"],["var(--c-yellow)","#291811"]];
let comboI=-1;
function paint(route){comboI=(comboI+1+Math.floor(Math.random()*(COMBOS.length-1)))%COMBOS.length;const [bg,ink]=COMBOS[comboI];curtain.style.setProperty("--cur-bg",bg);curtain.style.setProperty("--cur-ink",ink)}
async function go(route,push=true){
  route=P.some(p=>p.slug===route)||["home","work","about","contact"].includes(route)?route:"home";
  if(busy){queuedRoute={route,push};return}
  if(route===current)return;
  busy=true;
  if(push){try{history.pushState(null,"","#"+route)}catch(e){}}
  try{
    if(reduce){show(route);curtain.classList.add("up");return}
    document.body.classList.add("transitioning");
    document.querySelectorAll("video").forEach(v=>v.pause());
    curtain.classList.remove("up","first","done");curtain.classList.add("down");paint(route);
    const lg=curtain.querySelector("svg");lg.style.animation="none";void lg.offsetWidth;lg.style.animation="";
    void curtain.offsetHeight;
    await moveCurtain(()=>curtain.classList.remove("down"));
    show(route);
    await prepareReveal();
    await moveCurtain(()=>curtain.classList.add("up"));
  }finally{
    finishTransition();
    busy=false;
    if(queuedRoute){const next=queuedRoute;queuedRoute=null;go(next.route,next.push)}
  }
}
document.addEventListener("click",e=>{const a=e.target.closest("[data-route]");if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();go(a.dataset.route)});
addEventListener("popstate",()=>go((location.hash||"#home").slice(1),false));
addEventListener("hashchange",()=>go((location.hash||"#home").slice(1),false));


/* ---------------- boot: loader slides up ---------------- */
(async()=>{
  document.body.classList.add("locked","transitioning");
  /* first-load logo (stacked mark): letters rise one by one, M-A-L-L-E-R, &, M-O-N-D */
  const im=document.getElementById("introMark"),src=[...document.querySelectorAll("#mark-stack path")];
  const order=[[0],[1],[2],[3],[4],[5],[6],[10],[7],[8],[9]]; /* new SVG lists the M of MOND last */
  order.forEach((grp,k)=>grp.forEach(idx=>{const p=src[idx].cloneNode();p.style.setProperty("--d",(120+k*70)+"ms");im.appendChild(p)}));
  renderLists();
  show((location.hash||"#home").slice(1));
  busy=true;
  await wait(reduce?0:120+order.length*70+750);
  curtain.classList.add("done");
  await wait(reduce?0:650);
  if(reduce)curtain.classList.add("up");
  else{
    await prepareReveal();
    await moveCurtain(()=>curtain.classList.add("up"));
  }
  document.body.classList.remove("locked");
  finishTransition();
  busy=false;
  if(queuedRoute){const next=queuedRoute;queuedRoute=null;go(next.route,next.push)}
})();
/* portrait hover cursor */
const pcur=document.getElementById("pcur");
document.querySelectorAll("[data-cur]").forEach(f=>{
  f.addEventListener("mouseenter",()=>{pcur.innerHTML=f.dataset.cur;pcur.className="pcur on "+f.dataset.shape});
  f.addEventListener("mouseleave",()=>pcur.classList.remove("on"));
  let frame=0,x=0,y=0;
  f.addEventListener("mousemove",e=>{x=e.clientX;y=e.clientY;if(!frame)frame=requestAnimationFrame(()=>{pcur.style.translate=`${x}px ${y}px`;frame=0})});
});

/* mobile menu + hide logo on scroll */
const burger=document.getElementById("burger");
const setMenu=o=>{document.body.classList.toggle("menu-open",o);burger.setAttribute("aria-expanded",o)};
burger.addEventListener("click",()=>setMenu(!document.body.classList.contains("menu-open")));
document.getElementById("mainnav").addEventListener("click",()=>setMenu(false));
addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
addEventListener("scroll",()=>document.body.classList.toggle("scrolled",scrollY>40),{passive:true});
