import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

const API=import.meta.env.VITE_API_URL||"http://localhost:3001/api";
const IMG={
  harappa:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Harappa_Ruins_-_IV.jpg",
  madhubani:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Madhubani_painting.jpg",
  baul:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Baul_singer.jpg",
  kalamkari:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Kalamkari_painting.jpg",
  theyyam:"https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Theyyam.jpg",
  pattachitra:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Pattachitra_painting.jpg"
};
const heritage=[
{id:"madhubani",title:"Madhubani Painting",type:"Visual Art",place:"Bihar",period:"Living tradition",risk:46,image:IMG.madhubani,icon:"◈",desc:"A vibrant Mithila painting tradition carried through homes, rituals and generations of artists.",facts:["Mithila motifs","Natural pigments","Women-led transmission","Ritual & everyday art"]},
{id:"baul",title:"Baul Music",type:"Folk Tradition",place:"West Bengal",period:"Living oral tradition",risk:68,image:IMG.baul,icon:"♪",desc:"Songs, philosophy and travelling performance passed from voice to voice across Bengal.",facts:["Oral transmission","Ektara & instruments","Mystical poetry","Travelling performers"]},
{id:"kalamkari",title:"Kalamkari",type:"Textile Art",place:"Andhra Pradesh",period:"Living craft tradition",risk:39,image:IMG.kalamkari,icon:"✦",desc:"Hand-painted and block-printed textiles where dye, line and storytelling meet.",facts:["Hand drawing","Natural dyes","Block printing","Narrative textiles"]},
{id:"theyyam",title:"Theyyam",type:"Ritual Art",place:"Kerala",period:"Living ritual tradition",risk:31,image:IMG.theyyam,icon:"✺",desc:"A powerful ritual performance combining costume, dance, percussion and community memory.",facts:["Ritual performance","Elaborate costume","Percussion","Community participation"]},
{id:"pattachitra",title:"Pattachitra",type:"Visual Art",place:"Odisha",period:"Living craft tradition",risk:52,image:IMG.pattachitra,icon:"❋",desc:"Narrative cloth painting with disciplined lines, traditional pigments and regional stories.",facts:["Cloth preparation","Traditional pigments","Narrative painting","Chitrakara communities"]},
{id:"harappa",title:"Harappa",type:"Ancient Civilization",place:"Indus Valley",period:"c. 2600–1900 BCE",risk:82,image:IMG.harappa,icon:"🏺",desc:"An ancient urban centre remembered for planned streets, drainage, craft and long-distance trade.",facts:["Grid-planned streets","Advanced drainage","Craft workshops","Seals & trade"]}
];
const riskItems=[
 ["Baul Music","Declining number of practitioners",68,"High"],
 ["Kani Tribal Language","At risk of extinction",52,"High"],
 ["Kavadi Attam","Decreasing youth participation",71,"Medium"],
 ["Bamboo Craft","Lack of market support",74,"Medium"]
];
const states=["Rajasthan","Gujarat","Maharashtra","West Bengal","Odisha","Kerala","Tamil Nadu","Andhra Pradesh","Bihar","Punjab"];
async function api(path,opts={}){const r=await fetch(API+path,{headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`API ${r.status}`);return r.json()}

function Icon({children}){return <span className="nav-icon">{children}</span>}
function App(){
 const [page,setPage]=useState("home"),[query,setQuery]=useState(""),[items,setItems]=useState(heritage),[selected,setSelected]=useState(null),[modal,setModal]=useState(null),[posts,setPosts]=useState([]),[online,setOnline]=useState(false),[toast,setToast]=useState("");
 const notify=x=>{setToast(x);setTimeout(()=>setToast(""),2500)};
 useEffect(()=>{api("/health").then(()=>setOnline(true)).catch(()=>setOnline(false));api("/heritage").then(d=>{if(Array.isArray(d)&&d.length)setItems(d.map(x=>({...heritage.find(h=>h.id===x.id),...x,image:x.image||heritage.find(h=>h.id===x.id)?.image}))) }).catch(()=>{});api("/posts").then(setPosts).catch(()=>{})},[]);
 const search=async value=>{setQuery(value);if(!value){setItems(heritage);return}try{const d=await api("/heritage?q="+encodeURIComponent(value));setItems(d)}catch{setItems(heritage.filter(x=>(x.title+x.type+x.place+x.desc).toLowerCase().includes(value.toLowerCase())))} };
 const open=h=>setSelected(h);
 const featured=useMemo(()=>items.slice(0,6),[items]);
 const nav=p=>{setPage(p);window.scrollTo({top:0,behavior:"smooth"})};
 return <div className="app">
   <aside className="sidebar">
     <button className="brand" onClick={()=>nav("home")}><span className="brand-symbol">✺</span><span className="brand-name">LIVING <b>INDIA</b></span><small>PEOPLE · CULTURE · STORIES · FOREVER</small></button>
     <div className="side-links">
       <button className={page==="home"?"active":""} onClick={()=>nav("home")}><Icon>⌂</Icon>Home</button>
       <button className={page==="explore"?"active":""} onClick={()=>nav("explore")}><Icon>⌕</Icon>Explore</button>
       <button className={page==="map"?"active":""} onClick={()=>nav("map")}><Icon>◈</Icon>Map</button>
       <button className={page==="community"?"active":""} onClick={()=>nav("community")}><Icon>♧</Icon>Community</button>
       <button onClick={()=>setModal("contribute")}><Icon>✎</Icon>Contribute</button>
       <button className={page==="risk"?"active":""} onClick={()=>nav("risk")}><Icon>△</Icon>At Risk</button>
       <button onClick={()=>open(heritage.find(x=>x.id==="harappa"))}><Icon>♜</Icon>Harappa</button>
     </div>
     <div className="side-bottom"><button><Icon>ⓘ</Icon>About</button><button onClick={()=>setModal("signin")}><Icon>♙</Icon>Login</button></div>
     <div className="sidebar-note"><span>✦</span><div>OUR HERITAGE<br/><b>LIVES THROUGH YOU</b></div></div>
   </aside>

   <main className="content">
     <header className="topbar">
       <div className="mobile-brand">LIVING <b>INDIA</b></div>
       <div className="search"><span>⌕</span><input value={query} onChange={e=>search(e.target.value)} placeholder="Search a heritage, art form, place, or story..."/><kbd>⌘ K</kbd></div>
       <div className="top-actions"><span className={online?"live":"demo"}>● {online?"LIVE":"DEMO"}</span><button>♧</button><button className="avatar" onClick={()=>setModal("signin")}>✦</button></div>
     </header>

     {page==="home"&&<>
       <section className="hero">
         <div className="hero-art">
           <div className="sun"></div><div className="mountains"></div><div className="temple temple-left">♜</div><div className="temple temple-right">♜</div>
           <div className="hero-map"><div className="map-shape">INDIA</div><span className="pin p1">✦</span><span className="pin p2">✦</span><span className="pin p3">✦</span><span className="pin p4">✦</span></div>
           <div className="map-lines"></div>
           <div className="quote-top">“Sanskriti na kabhi purani hoti hai,<br/>na kabhi nai — woh hamesha jeevit rehti hai.”<small>— Anonymous</small></div>
           <div className="compass">N<br/><span>✧</span><br/>S</div>
         </div>
         <div className="hero-copy"><div className="eyebrow">INDIA'S LIVING HERITAGE</div><h1>Discover<br/><i>Living Heritage</i></h1><h2>Stories. People. Places. A Living India.</h2><p>Explore the traditions, art forms, languages and living cultures that make India eternal.</p><div className="hero-buttons"><button className="primary" onClick={()=>nav("explore")}>Start Exploring <b>→</b></button><button className="outline" onClick={()=>setModal("contribute")}>Share a Story <b>＋</b></button></div></div>
         <div className="hero-side"><span>EK</span><b>BHARAT</b><span>ANEK</span><b>KAHAANIYAN</b><div className="side-arrow">→</div><small>Different Stories<br/>Same Soul</small></div>
       </section>
       <section className="featured section"><div className="section-head"><h2>✺ Featured Heritage</h2><button onClick={()=>nav("explore")}>View All →</button></div><div className="cards">{featured.map(h=><HeritageCard key={h.id} h={h} onClick={open}/>)}</div></section>
       <section className="split section"><RiskPanel onClick={()=>nav("risk")}/><Community posts={posts} onClick={()=>nav("community")}/></section>
       <footer><span>❋ Preserve</span><span>✦ Participate</span><span>✺ Pass It On</span><b>INDIA LIVES IN ITS PEOPLE ✦</b></footer>
     </>}

     {page==="explore"&&<Explore items={items} onOpen={open}/>} 
     {page==="risk"&&<div className="page-wrap"><div className="page-title"><div className="eyebrow">PRESERVATION</div><h1>Heritage at <i>Risk</i></h1><p>Traditions survive when people practise, teach, document and support them.</p></div><RiskPanel large/></div>}
     {page==="community"&&<div className="page-wrap"><div className="page-title"><div className="eyebrow">FROM THE COMMUNITY</div><h1>Stories from <i>the people</i></h1><p>Living heritage is not just history. It is what people still do, teach and remember.</p></div><Community posts={posts} large onClick={()=>{}}/></div>}
     {page==="map"&&<MapPage items={items} onOpen={open}/>} 
   </main>
   {selected&&<Detail h={selected} close={()=>setSelected(null)} onContribute={()=>setModal("contribute")}/>} 
   {modal&&<Modal type={modal} close={()=>setModal(null)} notify={notify}/>} 
   {toast&&<div className="toast">{toast}</div>}
 </div>
}
function HeritageCard({h,onClick}){return <button className="heritage-card" onClick={()=>onClick(h)}><div className="card-img"><img src={h.image} alt=""/><span className="card-icon">{h.icon||"✦"}</span></div><div className="card-info"><h3>{h.title}</h3><p>{h.place}</p><small>{h.type}</small><span className="card-arrow">→</span></div></button>}
function RiskPanel({onClick,large}){return <div className={large?"panel risk-panel large":"panel risk-panel"}><div className="panel-head"><h2>⚠ Heritage at Risk</h2>{onClick&&<button onClick={onClick}>View All →</button>}</div>{riskItems.map(([name,desc,val,level])=><button className="risk-row" key={name} onClick={onClick}><span className={'badge '+level.toLowerCase()}>{level}</span><span className="risk-name"><b>{name}</b><small>{desc}</small></span><span className="bar"><i style={{width:val+"%"}}></i></span><em>{val}/100</em></button>)}</div>}
function Community({posts,large,onClick}){const data=posts.length?posts:[{user:"Ananya S.",text:"My grandmother still paints Madhubani at home. Here's a short story about her work...",tag:"#Madhubani",img:IMG.madhubani,likes:124},{user:"Rahul K.",text:"Visited a traditional boat making community in Kerala. The craftsmanship is incredible!",tag:"#LivingTraditions",img:IMG.harappa,likes:98}];return <div className={large?"panel community large":"panel community"}><div className="panel-head"><h2>◌ Community Voices</h2><button onClick={onClick}>Post a Story ＋</button></div>{data.slice(0,4).map((p,i)=><article className="post" key={i}><img src={p.img||IMG.madhubani} alt=""/><div><b>{p.user||"Heritage Explorer"}</b><p>{p.text||p.story}</p><small>♥ {p.likes||0}　♡ {p.comments||8}　 {p.tag||"#LivingIndia"}</small></div></article>)}</div>}
function Explore({items,onOpen}){return <div className="page-wrap"><div className="page-title"><div className="eyebrow">EXPLORE INDIA</div><h1>Stories worth <i>discovering</i></h1><p>From ancient cities to living crafts, explore the many threads of India's cultural memory.</p></div><div className="filter-row"><button className="selected">All</button><button>Art & Craft</button><button>Music</button><button>Performance</button><button>Archaeology</button></div><div className="explore-grid">{items.map(h=><HeritageCard key={h.id} h={h} onClick={onOpen}/>)}</div></div>}
function MapPage({items,onOpen}){return <div className="page-wrap map-page"><div className="page-title"><div className="eyebrow">A CULTURAL MAP</div><h1>One India, <i>many worlds</i></h1><p>Choose a region to uncover its traditions, stories and living practices.</p></div><div className="big-map"><div className="map-illustration">INDIA</div>{states.map((s,i)=><button key={s} style={{left:(15+(i*17)%70)+"%",top:(18+(i*29)%65)+"%"}} onClick={()=>onOpen(items[i%items.length])}>{s}</button>)}</div></div>}
function Detail({h,close,onContribute}){return <div className="detail-overlay" onClick={close}><div className="detail" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}>×</button><div className="detail-image"><img src={h.image} alt=""/><div><span>{h.type}</span><span>{h.period}</span></div></div><div className="detail-body"><div className="eyebrow">{h.place}</div><h1>{h.title}</h1><p className="lead">{h.desc}</p><div className="fact-grid">{(h.facts||[]).map(x=><div key={x}><span>✦</span>{x}</div>)}</div><div className="detail-actions"><button className="primary" onClick={onContribute}>Add your story ＋</button><button className="outline" onClick={close}>Continue exploring</button></div></div></div></div>}
function Modal({type,close,notify}){const contribute=type==="contribute";return <div className="modal-overlay" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}>×</button>{contribute?<><div className="eyebrow">COMMUNITY ARCHIVE</div><h2>Share a living story</h2><p>Your memory, craft, recipe, song or local tradition can become part of India's digital heritage.</p><form onSubmit={e=>{e.preventDefault();close();notify("Story submitted for review ✓")}}><input name="title" required placeholder="Story title"/><input name="topic" placeholder="Place or tradition"/><textarea name="story" required placeholder="Tell us the story..."/><button className="primary" type="submit">Submit for review →</button></form></>:<><div className="eyebrow">WELCOME BACK</div><h2>Enter Living India</h2><p>Sign in to save discoveries, collect artifacts and share your own heritage stories.</p><input placeholder="Email address"/><button className="primary" onClick={()=>{close();notify("Demo sign-in ready ✓")}}>Continue →</button></>}</div></div>}

createRoot(document.getElementById("root")).render(<App/>);
