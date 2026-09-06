const INDIA_GEOJSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/india.geojson";
const D3_GEO_URL = "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm";

const CATEGORY_LABELS = [
  ["Art & Craft", "🎨"],
  ["Music & Performance", "🎵"],
  ["Food & Culinary", "🍲"],
  ["Festivals & Traditions", "🪔"],
  ["Language & Literature", "📖"],
  ["Architecture & Places", "🏛️"],
  ["Stories & Folklore", "✦"]
];

const STYLE = `
.li-real-map{position:relative;width:100%;min-height:620px;border:1px solid rgba(117,70,39,.28);background:linear-gradient(145deg,#f5ead4,#ead9b9);overflow:hidden;border-radius:18px;box-shadow:inset 0 0 70px rgba(90,52,30,.08)}
.li-real-map svg{display:block;width:100%;height:620px;touch-action:none;cursor:grab}
.li-real-map svg:active{cursor:grabbing}
.li-map-toolbar{position:absolute;right:16px;top:16px;display:flex;gap:7px;z-index:20;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.25);border-radius:12px;padding:6px;box-shadow:0 8px 22px rgba(63,37,21,.12)}
.li-map-toolbar button{width:42px;height:42px;border:1px solid rgba(101,62,37,.2);border-radius:9px;background:#f9f0df;color:#50301f;font-size:21px;font-weight:700;cursor:pointer}
.li-map-toolbar button:hover{background:#ead5ad}
.li-map-title{position:absolute;left:18px;top:16px;z-index:20;padding:10px 14px;border-radius:12px;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.2);color:#50301f;pointer-events:none}
.li-map-title b{display:block;font-size:15px;letter-spacing:.08em;text-transform:uppercase}.li-map-title small{display:block;margin-top:2px;opacity:.7;font-size:11px}
.li-state{stroke:#76502f;stroke-width:.8;fill:#d9b87e;fill-opacity:.8;vector-effect:non-scaling-stroke;cursor:pointer;transition:fill-opacity .15s,stroke-width .15s}
.li-state:hover{fill:#b96f3f;fill-opacity:.95;stroke:#63351f;stroke-width:1.7}
.li-state.selected{fill:#9f5532;fill-opacity:1;stroke:#4e281a;stroke-width:2}
.li-state-label{font-family:Georgia,serif;font-size:10px;font-weight:700;fill:#4d2d1d;paint-order:stroke;stroke:#f5ead4;stroke-width:3px;stroke-linejoin:round;pointer-events:none;text-anchor:middle}
.li-state-label.small{font-size:8px}
.li-map-hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:3;padding:7px 12px;border-radius:999px;background:rgba(80,48,31,.9);color:#f9efd9;font-size:11px;letter-spacing:.03em;pointer-events:none;white-space:nowrap}
.li-category-overlay{position:absolute;inset:0;z-index:30;display:none;align-items:flex-end;justify-content:center;padding:18px;background:rgba(40,24,14,.2)}
.li-category-overlay.open{display:flex}
.li-category-panel{width:min(520px,calc(100% - 24px));max-height:78%;overflow:auto;background:#f8eedb;border:1px solid rgba(101,62,37,.28);border-radius:18px;padding:20px;box-shadow:0 18px 55px rgba(44,25,14,.3)}
.li-category-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:15px}.li-category-head h3{margin:0;color:#50301f;font:700 24px Georgia,serif}.li-category-head p{margin:5px 0 0;color:#80644f;font-size:12px}.li-category-close{border:0;background:transparent;color:#50301f;font-size:28px;cursor:pointer;line-height:1}
.li-category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.li-category{border:1px solid rgba(101,62,37,.18);background:#fff8ea;border-radius:12px;padding:14px;text-align:left;color:#50301f;cursor:pointer;min-height:72px}.li-category:hover{border-color:#a96a3d;background:#f4e1bd}.li-category strong{display:block;font-size:14px}.li-category span{font-size:20px;display:block;margin-bottom:6px}
@media(max-width:700px){.li-real-map{min-height:480px}.li-real-map svg{height:480px}.li-map-title{left:10px;top:10px}.li-map-toolbar{right:10px;top:10px}.li-map-toolbar button{width:38px;height:38px}.li-map-hint{font-size:10px;max-width:90%;overflow:hidden;text-overflow:ellipsis}.li-category-grid{grid-template-columns:1fr}.li-category-panel{padding:16px}}
`;

let d3Promise = null;

function injectStyle(){
  if(document.getElementById("li-real-map-style")) return;
  const style=document.createElement("style");
  style.id="li-real-map-style";
  style.textContent=STYLE;
  document.head.appendChild(style);
}

function getD3(){
  if(!d3Promise) d3Promise=import(D3_GEO_URL);
  return d3Promise;
}

function stateName(feature){
  const p=feature?.properties||{};
  return p.ST_NM || p.NAME_1 || p.name || p.State || p.state || "Indian Region";
}

function makeMap(host,d3){
  if(!host || host.dataset.realMapReady || host.dataset.realMapLoading) return;
  host.dataset.realMapLoading="1";
  host.innerHTML="";
  host.className="culture-map li-real-map";

  const title=document.createElement("div");
  title.className="li-map-title";
  title.innerHTML="<b>Explore India</b><small>Tap a state or union territory · pinch / scroll to zoom</small>";
  host.appendChild(title);

  const toolbar=document.createElement("div");
  toolbar.className="li-map-toolbar";
  toolbar.innerHTML='<button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" aria-label="Reset map">⌂</button>';
  host.appendChild(toolbar);

  const svg=d3.select(host).append("svg").attr("viewBox","0 0 1000 620").attr("role","img").attr("aria-label","Clickable map of India by state and union territory");
  const root=svg.append("g");
  const path=d3.geoPath();

  const showCategories=(name)=>{
    host.querySelectorAll(".li-category-overlay").forEach(x=>x.remove());
    const overlay=document.createElement("div");
    overlay.className="li-category-overlay open";
    overlay.innerHTML=`<div class="li-category-panel" role="dialog" aria-modal="true"><div class="li-category-head"><div><h3>${name}</h3><p>Choose how you want to explore this region.</p></div><button class="li-category-close" type="button" aria-label="Close">×</button></div><div class="li-category-grid">${CATEGORY_LABELS.map(([label,icon])=>`<button class="li-category" type="button"><span>${icon}</span><strong>${label}</strong></button>`).join("")}</div></div>`;
    host.appendChild(overlay);
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove()});
    overlay.querySelector(".li-category-close").addEventListener("click",()=>overlay.remove());
    overlay.querySelectorAll(".li-category").forEach(btn=>btn.addEventListener("click",()=>{
      overlay.querySelectorAll(".li-category").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
    }));
  };

  fetch(INDIA_GEOJSON,{cache:"force-cache"})
    .then(r=>{if(!r.ok) throw new Error("Map data failed"); return r.json()})
    .then(data=>{
      const features=(data.features||[]).filter(f=>f.geometry);
      if(!features.length) throw new Error("No India boundary features found");
      const collection={type:"FeatureCollection",features};
      const projection=d3.geoMercator().fitExtent([[45,45],[955,575]],collection);
      path.projection(projection);

      root.selectAll("path")
        .data(features)
        .join("path")
        .attr("class","li-state")
        .attr("d",path)
        .attr("tabindex",0)
        .attr("aria-label",d=>stateName(d))
        .on("click",function(event,d){
          event.stopPropagation();
          root.selectAll("path").classed("selected",false);
          d3.select(this).classed("selected",true);
          showCategories(stateName(d));
        })
        .on("keydown",function(event,d){if(event.key==="Enter"||event.key===" "){event.preventDefault();showCategories(stateName(d));}});

      root.selectAll("text")
        .data(features)
        .join("text")
        .attr("class",d=>stateName(d).length>17?"li-state-label small":"li-state-label")
        .attr("x",d=>path.centroid(d)[0])
        .attr("y",d=>path.centroid(d)[1])
        .text(d=>stateName(d));

      const zoom=d3.zoom().scaleExtent([1,8]).on("zoom",event=>root.attr("transform",event.transform));
      svg.call(zoom);
      toolbar.querySelector('[data-zoom="in"]').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,1.5);
      toolbar.querySelector('[data-zoom="out"]').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,0.67);
      toolbar.querySelector('[data-zoom="reset"]').onclick=()=>svg.transition().duration(220).call(zoom.transform,d3.zoomIdentity);
      host.dataset.realMapReady="1";
      delete host.dataset.realMapLoading;
    })
    .catch(err=>{
      delete host.dataset.realMapLoading;
      console.error("Living India map data error",err);
      host.innerHTML='<div style="padding:32px;text-align:center;color:#50301f;font-family:Georgia,serif"><h3>India map could not load</h3><p>Please refresh once the map data connection is available.</p><button type="button" class="li-map-retry" style="margin-top:12px;padding:10px 16px;border:1px solid rgba(101,62,37,.25);border-radius:9px;background:#f9f0df;color:#50301f;cursor:pointer">Retry map</button></div>';
      host.querySelector(".li-map-retry")?.addEventListener("click",()=>makeMap(host,d3));
    });
}

async function initRealMap(host){
  if(!host || host.dataset.realMapReady || host.dataset.realMapLoading) return;
  injectStyle();
  try{
    const d3=await getD3();
    makeMap(host,d3);
  }catch(err){
    console.error("Living India map error",err);
    delete host.dataset.realMapLoading;
  }
}

function scanMaps(){
  document.querySelectorAll(".culture-map").forEach(host=>initRealMap(host));
}

const observer=new MutationObserver(scanMaps);
observer.observe(document.body,{childList:true,subtree:true});
scanMaps();
