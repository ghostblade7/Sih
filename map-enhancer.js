const INDIA_GEOJSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/india.geojson";
const D3_GEO_URL = "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm";

const STYLE = `
.li-real-map{position:relative;width:100%;min-height:620px;border:1px solid rgba(117,70,39,.28);background:linear-gradient(145deg,#f5ead4,#ead9b9);overflow:hidden;border-radius:18px;box-shadow:inset 0 0 70px rgba(90,52,30,.08)}
.li-real-map.full{min-height:720px}
.li-real-map svg{display:block;width:100%;height:620px;touch-action:none;cursor:grab}
.li-real-map.full svg{height:720px}
.li-real-map svg:active{cursor:grabbing}
.li-map-toolbar{position:absolute;right:16px;top:16px;display:flex;gap:7px;z-index:4;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.25);border-radius:12px;padding:6px;box-shadow:0 8px 22px rgba(63,37,21,.12)}
.li-map-toolbar button{width:42px;height:42px;border:1px solid rgba(101,62,37,.2);border-radius:9px;background:#f9f0df;color:#50301f;font-size:21px;font-weight:700;cursor:pointer}
.li-map-toolbar button:hover{background:#ead5ad}
.li-map-title{position:absolute;left:18px;top:16px;z-index:4;padding:10px 14px;border-radius:12px;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.2);color:#50301f;pointer-events:none}
.li-map-title b{display:block;font-size:15px;letter-spacing:.08em;text-transform:uppercase}.li-map-title small{display:block;margin-top:2px;opacity:.7;font-size:11px}
.li-state{stroke:#76502f;stroke-width:.8;fill:#d9b87e;fill-opacity:.8;vector-effect:non-scaling-stroke;cursor:pointer;transition:fill-opacity .15s,stroke-width .15s}
.li-state:hover{fill:#b96f3f;fill-opacity:.95;stroke:#63351f;stroke-width:1.7}
.li-state.selected{fill:#9f5532;fill-opacity:1;stroke:#4e281a;stroke-width:2}
.li-state-label{font-family:Georgia,serif;font-size:10px;font-weight:700;fill:#4d2d1d;paint-order:stroke;stroke:#f5ead4;stroke-width:3px;stroke-linejoin:round;pointer-events:none;text-anchor:middle}
.li-state-label.small{font-size:8px}
.li-state-panel{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:8;width:min(460px,calc(100% - 28px));padding:14px 18px;border-radius:14px;background:rgba(248,239,218,.97);border:1px solid rgba(101,62,37,.25);box-shadow:0 12px 32px rgba(63,37,21,.2);display:flex;align-items:center;justify-content:space-between;gap:14px;color:#50301f}
.li-state-panel strong{font:700 20px Georgia,serif}.li-state-panel small{display:block;margin-top:3px;color:#80644f}.li-state-close{border:0;background:transparent;color:#50301f;font-size:25px;cursor:pointer;line-height:1}
@media(max-width:700px){.li-real-map{min-height:480px}.li-real-map.full{min-height:540px}.li-real-map svg,.li-real-map.full svg{height:480px}.li-real-map.full svg{height:540px}.li-map-title{left:10px;top:10px}.li-map-toolbar{right:10px;top:10px}.li-map-toolbar button{width:38px;height:38px}.li-state-panel{bottom:10px;padding:11px 14px}.li-state-panel strong{font-size:17px}}
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
  return p.ST_NM || p.NAME_1 || p.NAME_2 || p.name || p.State || p.state || "Indian Region";
}

function makeMap(host,d3){
  if(!host || host.dataset.realMapState==="ready" || host.dataset.realMapState==="loading") return;
  host.dataset.realMapState="loading";
  host.classList.add("li-real-map");
  host.innerHTML="";

  const title=document.createElement("div");
  title.className="li-map-title";
  title.innerHTML="<b>Explore India</b><small>Tap a state or union territory · pinch / scroll to zoom</small>";
  host.appendChild(title);

  const toolbar=document.createElement("div");
  toolbar.className="li-map-toolbar";
  toolbar.innerHTML='<button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" aria-label="Reset map">⌂</button>';
  host.appendChild(toolbar);

  const svg=d3.select(host).append("svg")
    .attr("viewBox",`0 0 1000 ${host.classList.contains("full")?720:620}`)
    .attr("role","img")
    .attr("aria-label","Clickable map of India by state and union territory");
  const root=svg.append("g");
  const path=d3.geoPath();

  fetch(INDIA_GEOJSON,{cache:"force-cache"})
    .then(r=>{if(!r.ok) throw new Error(`Map data HTTP ${r.status}`);return r.json()})
    .then(data=>{
      const features=(data.features||[]).filter(f=>f.geometry);
      if(!features.length) throw new Error("No India map features found");
      const collection={type:"FeatureCollection",features};
      const height=host.classList.contains("full")?720:620;
      const projection=d3.geoMercator().fitExtent([[45,45],[955,height-45]],collection);
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
          showState(host,stateName(d));
        })
        .on("keydown",function(event,d){
          if(event.key==="Enter"||event.key===" "){
            event.preventDefault();
            root.selectAll("path").classed("selected",false);
            d3.select(this).classed("selected",true);
            showState(host,stateName(d));
          }
        });

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
      toolbar.querySelector('[data-zoom="reset"]').onclick=()=>svg.transition().duration(180).call(zoom.transform,d3.zoomIdentity);
      host.dataset.realMapState="ready";
    })
    .catch(err=>{
      console.error("Living India map error",err);
      host.dataset.realMapState="failed";
      host.innerHTML='<div style="padding:40px;text-align:center;color:#50301f;font-family:Georgia,serif"><h3>India map could not load</h3><p>Check your connection and try again.</p><button type="button" class="li-map-retry" style="margin-top:12px;padding:9px 14px;border:1px solid rgba(101,62,37,.25);border-radius:9px;background:#f9f0df;color:#50301f;cursor:pointer">Retry map</button></div>';
      host.querySelector(".li-map-retry").onclick=()=>{host.dataset.realMapState="";makeMap(host,d3)};
    });
}

function showState(host,name){
  host.querySelector(".li-state-panel")?.remove();
  const panel=document.createElement("div");
  panel.className="li-state-panel";
  panel.innerHTML=`<div><strong>${name}</strong><small>State selected — heritage options will open here next.</small></div><button class="li-state-close" type="button" aria-label="Close">×</button>`;
  host.appendChild(panel);
  panel.querySelector(".li-state-close").onclick=()=>panel.remove();
}

async function initRealMap(host){
  if(!host || host.dataset.realMapState==="ready" || host.dataset.realMapState==="loading") return;
  injectStyle();
  try{
    const d3=await getD3();
    makeMap(host,d3);
  }catch(err){
    console.error("Living India map import error",err);
    host.dataset.realMapState="failed";
  }
}

function scanMaps(){
  document.querySelectorAll(".culture-map:not([data-real-map-state='ready']):not([data-real-map-state='loading'])").forEach(initRealMap);
}

const observer=new MutationObserver(scanMaps);
observer.observe(document.body,{childList:true,subtree:true});
scanMaps();
