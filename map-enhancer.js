const INDIA_GEOJSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/india.geojson";
const D3_GEO_URL = "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm";

const STYLE = `
.li-real-map{position:relative;width:100%;min-height:620px;border:1px solid rgba(117,70,39,.28);background:linear-gradient(145deg,#f5ead4,#ead9b9);overflow:hidden;border-radius:18px;box-shadow:inset 0 0 70px rgba(90,52,30,.08)}
.li-real-map svg{display:block;width:100%;height:620px;touch-action:none;cursor:grab}.li-real-map svg:active{cursor:grabbing}
.li-map-toolbar{position:absolute;right:16px;top:16px;display:flex;gap:7px;z-index:4;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.25);border-radius:12px;padding:6px;box-shadow:0 8px 22px rgba(63,37,21,.12)}
.li-map-toolbar button{width:42px;height:42px;border:1px solid rgba(101,62,37,.2);border-radius:9px;background:#f9f0df;color:#50301f;font-size:21px;font-weight:700;cursor:pointer}
.li-map-toolbar button:hover{background:#ead5ad}
.li-map-title{position:absolute;left:18px;top:16px;z-index:4;padding:10px 14px;border-radius:12px;background:rgba(248,239,218,.94);border:1px solid rgba(101,62,37,.2);color:#50301f;pointer-events:none}.li-map-title b{display:block;font-size:15px;letter-spacing:.08em;text-transform:uppercase}.li-map-title small{display:block;margin-top:2px;opacity:.7;font-size:11px}
.li-state{stroke:#76502f;stroke-width:.8;fill:#d9b87e;fill-opacity:.8;vector-effect:non-scaling-stroke;cursor:pointer;transition:fill-opacity .15s,stroke-width .15s}.li-state:hover{fill:#b96f3f;fill-opacity:.95;stroke:#63351f;stroke-width:1.7}.li-state.selected{fill:#9f5532;fill-opacity:1;stroke:#4e281a;stroke-width:2}
.li-state-label{font-family:Georgia,serif;font-size:10px;font-weight:700;fill:#4d2d1d;paint-order:stroke;stroke:#f5ead4;stroke-width:3px;stroke-linejoin:round;pointer-events:none;text-anchor:middle}.li-state-label.small{font-size:8px}
@media(max-width:700px){.li-real-map{min-height:480px}.li-real-map svg{height:480px}.li-map-title{left:10px;top:10px}.li-map-toolbar{right:10px;top:10px}.li-map-toolbar button{width:38px;height:38px}}
`;

let d3Promise=null;
let observerStarted=false;

function injectStyle(){if(document.getElementById("li-real-map-style"))return;const style=document.createElement("style");style.id="li-real-map-style";style.textContent=STYLE;document.head.appendChild(style)}
function getD3(){return d3Promise||(d3Promise=import(D3_GEO_URL))}
function stateName(feature){const p=feature?.properties||{};return p.ST_NM||p.NAME_1||p.name||p.State||p.state||"Indian Region"}

function makeMap(host,d3){
  if(!host||host.dataset.realMapReady)return;
  const originalClass=host.className;
  host.dataset.realMapState="loading";
  host.className=originalClass+" li-real-map";
  host.innerHTML="";

  const title=document.createElement("div");title.className="li-map-title";title.innerHTML="<b>Explore India</b><small>Tap a state or union territory · pinch / scroll to zoom</small>";host.appendChild(title);
  const toolbar=document.createElement("div");toolbar.className="li-map-toolbar";toolbar.innerHTML='<button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" aria-label="Reset map">⌂</button>';host.appendChild(toolbar);
  const svg=d3.select(host).append("svg").attr("viewBox","0 0 1000 620").attr("role","img").attr("aria-label","Clickable map of India by state and union territory");
  const root=svg.append("g");
  const path=d3.geoPath();

  fetch(INDIA_GEOJSON,{cache:"force-cache"}).then(r=>{if(!r.ok)throw new Error("Map data failed");return r.json()}).then(data=>{
    const features=(data.features||[]).filter(f=>f.geometry);
    if(!features.length)throw new Error("No map features");
    const collection={type:"FeatureCollection",features};
    const projection=d3.geoMercator().fitExtent([[45,45],[955,575]],collection);path.projection(projection);
    root.selectAll("path").data(features).join("path").attr("class","li-state").attr("d",path).attr("tabindex",0).attr("aria-label",d=>stateName(d)).on("click",function(event,d){event.stopPropagation();root.selectAll("path").classed("selected",false);d3.select(this).classed("selected",true);if(window.__livingIndiaStateClick)window.__livingIndiaStateClick(stateName(d))}).on("keydown",function(event,d){if(event.key==="Enter"||event.key===" "){event.preventDefault();if(window.__livingIndiaStateClick)window.__livingIndiaStateClick(stateName(d))}});
    root.selectAll("text").data(features).join("text").attr("class",d=>stateName(d).length>17?"li-state-label small":"li-state-label").attr("x",d=>path.centroid(d)[0]).attr("y",d=>path.centroid(d)[1]).text(d=>stateName(d));
    const zoom=d3.zoom().scaleExtent([1,8]).on("zoom",event=>root.attr("transform",event.transform));
    svg.call(zoom);
    toolbar.querySelector('[data-zoom="in"]').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,1.5);
    toolbar.querySelector('[data-zoom="out"]').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,0.67);
    toolbar.querySelector('[data-zoom="reset"]').onclick=()=>svg.transition().duration(180).call(zoom.transform,d3.zoomIdentity);
    host.dataset.realMapReady="1";host.dataset.realMapState="ready";
  }).catch(err=>{console.error("Living India map data error",err);host.dataset.realMapState="error";host.innerHTML='<div style="padding:32px;text-align:center;color:#50301f;font-family:Georgia,serif"><h3>India map could not load</h3><p>Please refresh once the map data connection is available.</p><button type="button" data-map-retry style="margin-top:12px;padding:10px 16px;border-radius:9px;border:1px solid #76502f;background:#f9f0df;color:#50301f;cursor:pointer">Retry map</button></div>';host.querySelector('[data-map-retry]').onclick=()=>{delete host.dataset.realMapState;makeMap(host,d3)};});
}

async function initRealMap(host){if(!host||host.dataset.realMapReady||host.dataset.realMapState==="loading")return;injectStyle();try{const d3=await getD3();makeMap(host,d3)}catch(err){console.error("Living India map error",err);host.dataset.realMapState="error"}}
function scanMaps(){document.querySelectorAll(".culture-map").forEach(host=>{if(!host.dataset.realMapReady&&host.dataset.realMapState!=="loading")initRealMap(host)})}

// Keep the page itself scrollable. D3 owns pointer/touch gestures only inside the map SVG.
function restorePageScroll(){document.documentElement.style.removeProperty("overflow");document.body.style.removeProperty("overflow");document.documentElement.style.removeProperty("height");document.body.style.removeProperty("height")}
function wireStateBridge(){window.__livingIndiaStateClick=name=>{const target=window.__livingIndiaStateHandler;if(typeof target==="function")target(name)}}

injectStyle();wireStateBridge();restorePageScroll();
if(!observerStarted){const observer=new MutationObserver(()=>{restorePageScroll();scanMaps()});observer.observe(document.body,{childList:true,subtree:true});observerStarted=true}
scanMaps();
