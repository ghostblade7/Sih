import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "./ui-overrides.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const IMG = {
  harappa: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Harappa_Ruins_-_IV.jpg",
  madhubani: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Madhubani_painting.jpg",
  baul: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Baul_singer.jpg",
  kalamkari: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kalamkari_painting.jpg",
  theyyam: "https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Theyyam.jpg",
  pattachitra: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pattachitra_painting.jpg"
};

const heritage = [
  {
    id: "madhubani",
    title: "Madhubani Painting",
    type: "Visual Art",
    place: "Bihar",
    period: "Living tradition",
    interest: "art",
    image: IMG.madhubani,
    icon: "◈",
    desc: "A vibrant Mithila painting tradition carried through homes, rituals and generations of artists.",
    facts: ["Mithila motifs", "Natural pigments", "Women-led transmission", "Ritual & everyday art"]
  },
  {
    id: "baul",
    title: "Baul Music",
    type: "Folk Tradition",
    place: "West Bengal",
    period: "Living oral tradition",
    interest: "music",
    image: IMG.baul,
    icon: "♪",
    desc: "Songs, philosophy and travelling performance passed from voice to voice across Bengal.",
    facts: ["Oral transmission", "Ektara & instruments", "Mystical poetry", "Travelling performers"]
  },
  {
    id: "kalamkari",
    title: "Kalamkari",
    type: "Textile Art",
    place: "Andhra Pradesh",
    period: "Living craft tradition",
    interest: "craft",
    image: IMG.kalamkari,
    icon: "✦",
    desc: "Hand-painted and block-printed textiles where dye, line and storytelling meet.",
    facts: ["Hand drawing", "Natural dyes", "Block printing", "Narrative textiles"]
  },
  {
    id: "theyyam",
    title: "Theyyam",
    type: "Ritual Art",
    place: "Kerala",
    period: "Living ritual tradition",
    interest: "performance",
    image: IMG.theyyam,
    icon: "✺",
    desc: "A powerful ritual performance combining costume, dance, percussion and community memory.",
    facts: ["Ritual performance", "Elaborate costume", "Percussion", "Community participation"]
  },
  {
    id: "pattachitra",
    title: "Pattachitra",
    type: "Visual Art",
    place: "Odisha",
    period: "Living craft tradition",
    interest: "art",
    image: IMG.pattachitra,
    icon: "❋",
    desc: "Narrative cloth painting with disciplined lines, traditional pigments and regional stories.",
    facts: ["Cloth preparation", "Traditional pigments", "Narrative painting", "Chitrakara communities"]
  },
  {
    id: "harappa",
    title: "Harappa",
    type: "Ancient Civilization",
    place: "Indus Valley",
    period: "c. 2600–1900 BCE",
    interest: "history",
    image: IMG.harappa,
    icon: "🏺",
    desc: "An ancient urban centre remembered for planned streets, drainage, craft and long-distance trade.",
    facts: ["Grid-planned streets", "Advanced drainage", "Craft workshops", "Seals & trade"]
  }
];

const riskItems = [
  ["Baul Music", "Declining number of practitioners", 68, "High"],
  ["Kani Tribal Language", "At risk of extinction", 52, "High"],
  ["Kavadi Attam", "Decreasing youth participation", 71, "Medium"],
  ["Bamboo Craft", "Lack of market support", 74, "Medium"]
];

const experienceOptions = [
  ["image", "Interactive Explorer", "Tap into artworks, artefacts and visual stories."],
  ["timeline", "Timeline", "Drag through the journey from roots to today."],
  ["process", "How It’s Made", "Explore traditional processes step by step."],
  ["connections", "Culture Connections", "Follow links between food, art, rituals, places and people."],
  ["surprise", "You Might Be Surprised", "Find small discoveries and interactive facts."],
  ["quiz", "Quiz & Challenge", "Identify, answer and learn with lightweight challenges."],
  ["audio", "Listen & Explore", "Hear music, instruments, languages and oral traditions."],
  ["beforeafter", "Before / After", "Compare heritage across time with a visual slider."],
  ["community", "Stories from the Community", "Discover memories and traditions shared by people."],
  ["passport", "Heritage Passport", "Collect stamps as you explore India."]
];

const experienceDetails = {
  image: [
    "Interactive Heritage Explorer",
    "Explore an image instead of just reading about it. Future hotspots will reveal symbols, materials, people and hidden stories."
  ],
  timeline: [
    "Timeline — See the Journey",
    "Move through ancient roots, regional traditions, modern revival and the present day."
  ],
  process: [
    "How It’s Made",
    "A reusable step-by-step experience for crafts, food, architecture, music and traditional practices."
  ],
  connections: [
    "Culture Connections",
    "Discover how one tradition connects to other foods, arts, rituals, regions and communities."
  ],
  surprise: [
    "You Might Be Surprised…",
    "Tap, look closer and uncover small facts hidden inside heritage scenes and artefacts."
  ],
  quiz: [
    "Quiz & Challenge",
    "A common quiz engine can work across art, food, dance, architecture, textiles, instruments and festivals."
  ],
  audio: [
    "Listen & Explore",
    "Hear the sound of living culture and learn about instruments, language, rhythm and region."
  ],
  beforeafter: [
    "Before / After",
    "Drag between historical views and the present to understand how heritage changes over time."
  ],
  community: [
    "Stories from the Community",
    "Real memories, local knowledge, artist stories and traditions can become part of the digital archive."
  ],
  passport: [
    "Heritage Passport",
    "Collect virtual stamps for states, categories and heritage you have explored."
  ]
};

async function api(path, opts = {}) {
  const r = await fetch(API + path, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {})
    },
    ...opts
  });

  if (!r.ok) {
    throw new Error(
      (await r.json().catch(() => ({}))).error || `API ${r.status}`
    );
  }

  return r.json();
}

function daySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function dailyOrder(list, interest) {
  const filtered = interest === "all"
    ? list
    : list.filter(x => x.interest === interest);

  const source = filtered.length ? filtered : list;
  let seed = daySeed() + interest.length * 97;

  return [...source].sort(() => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 - .5;
  });
}

function Icon({ children }) {
  return <span className="nav-icon">{children}</span>;
}

function App() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(heritage);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [posts, setPosts] = useState([]);
  const [online, setOnline] = useState(false);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interest, setInterest] = useState(
    () => localStorage.getItem("li-interest") || "all"
  );
  const [slide, setSlide] = useState(0);
  const [selectedState, setSelectedState] = useState(null);

  const notify = x => {
    setToast(x);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    api("/health")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));

    api("/heritage")
      .then(d => {
        if (Array.isArray(d) && d.length) {
          setItems(
            d.map(x => ({
              ...heritage.find(h => h.id === x.id),
              ...x,
              image: x.image || heritage.find(h => h.id === x.id)?.image
            }))
          );
        }
      })
      .catch(() => { });

    api("/posts")
      .then(setPosts)
      .catch(() => { });
  }, []);

  useEffect(() => {
    localStorage.setItem("li-interest", interest);
    setSlide(0);
  }, [interest]);

  const stories = useMemo(
    () => dailyOrder(items, interest),
    [items, interest]
  );

  useEffect(() => {
    if (stories.length < 2) return;

    const t = setInterval(
      () => setSlide(s => (s + 1) % stories.length),
      5000
    );

    return () => clearInterval(t);
  }, [stories]);

  const search = async value => {
    setQuery(value);

    if (!value) {
      setItems(heritage);
      return;
    }

    try {
      setItems(
        await api("/heritage?q=" + encodeURIComponent(value))
      );
    } catch {
      setItems(
        heritage.filter(x =>
          (x.title + x.type + x.place + x.desc)
            .toLowerCase()
            .includes(value.toLowerCase())
        )
      );
    }
  };

  const open = h => {
    setSelected(h);
    setSidebarOpen(false);
  };

  const nav = p => {
    setPage(p);
    setSidebarOpen(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const showExperience = id => {
    setModal({
      type: "experience",
      id
    });
    setSidebarOpen(false);
  };

  return (
    <div className={sidebarOpen ? "app sidebar-is-open" : "app"}>

      <div
        className="scrim"
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className="sidebar">

        <button
          className="brand"
          onClick={() => nav("home")}
        >
          <span className="brand-symbol">✺</span>
          <span className="brand-name">
            LIVING <b>INDIA</b>
          </span>
          <small>
            PEOPLE · CULTURE · STORIES · FOREVER
          </small>
        </button>

        <div className="side-links">

          <button
            className={page === "home" ? "active" : ""}
            onClick={() => nav("home")}
          >
            <Icon>⌂</Icon>Home
          </button>

          <button
            className={page === "explore" ? "active" : ""}
            onClick={() => nav("explore")}
          >
            <Icon>⌕</Icon>Explore
          </button>

          <button
            className={page === "map" ? "active" : ""}
            onClick={() => nav("map")}
          >
            <Icon>◈</Icon>Map
          </button>

          <button
            className={page === "community" ? "active" : ""}
            onClick={() => nav("community")}
          >
            <Icon>♧</Icon>Community
          </button>

          <button
            onClick={() => setModal("contribute")}
          >
            <Icon>✎</Icon>Contribute
          </button>

          <button
            className={page === "risk" ? "active" : ""}
            onClick={() => nav("risk")}
          >
            <Icon>△</Icon>At Risk
          </button>

          <button
            onClick={() => open(
              heritage.find(x => x.id === "harappa")
            )}
          >
            <Icon>♜</Icon>Harappa
          </button>

        </div>

        <div className="side-bottom">

          <button>
            <Icon>ⓘ</Icon>About
          </button>

          {/* FIXED LOGIN */}
          <a
            href="./login.html"
            className="li-login-link"
          >
            <Icon>♙</Icon>Login
          </a>

        </div>

        <div className="sidebar-note">
          <span>✦</span>
          <div>
            OUR HERITAGE<br />
            <b>LIVES THROUGH YOU</b>
          </div>
        </div>

      </aside>

      <main className="content">

        <header className="topbar">

          <button
            className="burger"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(v => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="mobile-brand">
            LIVING <b>INDIA</b>
          </div>

          <div className="search">
            <span>⌕</span>

            <input
              value={query}
              onChange={e => search(e.target.value)}
              placeholder="Search a heritage, art form, place, or story..."
            />

            <kbd>⌘ K</kbd>
          </div>

          <div className="top-actions">

            <span className={online ? "live" : "demo"}>
              ● {online ? "LIVE" : "DEMO"}
            </span>

            <button>♧</button>

            {/* FIXED AVATAR LOGIN */}
            <a
              className="avatar"
              href="./login.html"
              aria-label="Login"
            >
              ✦
            </a>

          </div>

        </header>

        {page === "home" && (
          <>

            <section className="hero">

              <div className="hero-art">

                <div className="sun"></div>
                <div className="mountains"></div>

                <div className="temple temple-left">
                  ♜
                </div>

                <div className="temple temple-right">
                  ♜
                </div>

                <div className="hero-map">
                  <div className="map-shape">
                    INDIA
                  </div>

                  <span className="pin p1">✦</span>
                  <span className="pin p2">✦</span>
                  <span className="pin p3">✦</span>
                  <span className="pin p4">✦</span>
                </div>

                <div className="map-lines"></div>

                <div className="quote-top">
                  “Sanskriti na kabhi purani hoti hai,<br />
                  na kabhi nai — woh hamesha jeevit rehti hai.”
                  <small>— Anonymous</small>
                </div>

                <div className="compass">
                  N<br />
                  <span>✧</span><br />
                  S
                </div>

              </div>

              <div className="hero-copy">

                <div className="eyebrow">
                  INDIA'S LIVING HERITAGE
                </div>

                <h1>
                  Discover<br />
                  <i>Living Heritage</i>
                </h1>

                <h2>
                  Stories. People. Places. A Living India.
                </h2>

                <p>
                  Explore the traditions, art forms, languages and living cultures that make India eternal.
                </p>

                <div className="hero-buttons">

                  <button
                    className="primary"
                    onClick={() => nav("explore")}
                  >
                    Start Exploring <b>→</b>
                  </button>

                  <button
                    className="outline"
                    onClick={() => setModal("contribute")}
                  >
                    Share a Story <b>＋</b>
                  </button>

                </div>

              </div>

              <div className="hero-side">
                <span>EK</span>
                <b>BHARAT</b>
                <span>ANEK</span>
                <b>KAHAANIYAN</b>

                <div className="side-arrow">
                  →
                </div>

                <small>
                  Different Stories<br />
                  Same Soul
                </small>
              </div>

            </section>

            <section className="featured section">

              <div className="section-head">

                <div>
                  <h2>✺ Top Stories</h2>
                  <p>
                    Freshly arranged for you · changes daily
                  </p>
                </div>

                <button onClick={() => nav("explore")}>
                  View All →
                </button>

              </div>

              <div className="interest-tabs">

                {[
                  ["all", "For You"],
                  ["art", "Art & Craft"],
                  ["music", "Music"],
                  ["performance", "Performance"],
                  ["history", "History"]
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={interest === id ? "selected" : ""}
                    onClick={() => setInterest(id)}
                  >
                    {label}
                  </button>
                ))}

              </div>

              <div className="carousel-window">

                <div
                  className="cards carousel-track"
                  style={{
                    transform: `translateX(-${slide * 198}px)`
                  }}
                >
                  {stories.map(h => (
                    <HeritageCard
                      key={h.id}
                      h={h}
                      onClick={open}
                    />
                  ))}
                </div>

              </div>

              <div className="carousel-controls">

                <div>
                  {stories.map((h, i) => (
                    <button
                      key={h.id}
                      className={
                        i === slide
                          ? "dot active"
                          : "dot"
                      }
                      onClick={() => setSlide(i)}
                      aria-label={`Story ${i + 1}`}
                    ></button>
                  ))}
                </div>

                <span>
                  Auto-playing · today’s selection
                </span>

              </div>

            </section>

            <section className="experiences section">

              <div className="section-head">

                <div>
                  <h2>
                    ✦ Explore Heritage, Your Way
                  </h2>
                  <p>
                    Go beyond reading — listen, discover, compare and play.
                  </p>
                </div>

                <button
                  onClick={() => showExperience("passport")}
                >
                  Open Passport →
                </button>

              </div>

              <div className="experience-grid">

                {experienceOptions.map(
                  ([id, label, desc]) => (
                    <button
                      className="experience-card"
                      key={id}
                      onClick={() => showExperience(id)}
                    >
                      <span className="experience-icon">
                        {({
                          image: "▧",
                          timeline: "◷",
                          process: "✦",
                          connections: "⌘",
                          surprise: "!",
                          quiz: "?",
                          audio: "♪",
                          beforeafter: "↔",
                          community: "♧",
                          passport: "◇"
                        })[id]}
                      </span>

                      <div>
                        <b>{label}</b>
                        <small>{desc}</small>
                      </div>

                      <i>→</i>
                    </button>
                  )
                )}

              </div>

            </section>

            <section className="map-feature section">

              <div className="section-head">

                <div>
                  <h2>✦ Explore India by State</h2>
                  <p>
                    Every region carries a different story. Follow the glowing trail.
                  </p>
                </div>

                <button onClick={() => nav("map")}>
                  Open Full Map →
                </button>

              </div>

              <CulturalMap
                items={items}
                onOpen={open}
                onStateSelect={setSelectedState}
              />

            </section>

            <section className="split section">

              <RiskPanel
                onClick={() => nav("risk")}
              />

              <Community
                posts={posts}
                onClick={() => nav("community")}
              />

            </section>

            <footer>
              <span>❋ Preserve</span>
              <span>✦ Participate</span>
              <span>✺ Pass It On</span>
              <b>INDIA LIVES IN ITS PEOPLE ✦</b>
            </footer>

          </>
        )}

        {page === "explore" && (
          <Explore
            items={items}
            onOpen={open}
          />
        )}

        {page === "risk" && (
          <div className="page-wrap">

            <div className="page-title">
              <div className="eyebrow">
                PRESERVATION
              </div>

              <h1>
                Heritage at <i>Risk</i>
              </h1>

              <p>
                Traditions survive when people practise, teach, document and support them.
              </p>
            </div>

            <RiskPanel large />

          </div>
        )}

        {page === "community" && (
          <div className="page-wrap">

            <div className="page-title">

              <div className="eyebrow">
                FROM THE COMMUNITY
              </div>

              <h1>
                Stories from <i>the people</i>
              </h1>

              <p>
                Living heritage is not just history. It is what people still do, teach and remember.
              </p>

            </div>

            <Community
              posts={posts}
              large
              onClick={() => { }}
            />

          </div>
        )}

        {page === "map" && (
          <div className="page-wrap map-page">

            <div className="page-title">

              <div className="eyebrow">
                A CULTURAL MAP
              </div>

              <h1>
                One India, <i>many worlds</i>
              </h1>

              <p>
                Zoom, explore and select any state to choose the heritage you want to contribute.
              </p>

            </div>

            <CulturalMap
              items={items}
              onOpen={open}
              onStateSelect={setSelectedState}
              full
            />

          </div>
        )}

      </main>

      {selectedState && (
        <HeritageCategoryModal
          state={selectedState}
          onClose={() => setSelectedState(null)}
          onContinue={(categories) => {
            const label = categories.join(", ");
            notify(`${selectedState.name} · ${label} selected ✓`);
            setSelectedState(null);
          }}
        />
      )}
      {selected && (
        <Detail
          h={selected}
          close={() => setSelected(null)}
          onContribute={() => setModal("contribute")}
        />
      )}

      {modal && (
        <Modal
          type={modal}
          close={() => setModal(null)}
          notify={notify}
        />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </div>
  );
}

function HeritageCard({ h, onClick }) {
  return (
    <button
      className="heritage-card"
      onClick={() => onClick(h)}
    >
      <div className="card-img">

        <img
          src={h.image}
          alt=""
        />

        <span className="card-icon">
          {h.icon || "✦"}
        </span>

      </div>

      <div className="card-info">

        <h3>{h.title}</h3>

        <p>{h.place}</p>

        <small>{h.type}</small>

        <span className="card-arrow">
          →
        </span>

      </div>

    </button>
  );
}

function RiskPanel({ onClick, large }) {
  return (
    <div
      className={
        large
          ? "panel risk-panel large"
          : "panel risk-panel"
      }
    >

      <div className="panel-head">

        <h2>⚠ Heritage at Risk</h2>

        {onClick && (
          <button onClick={onClick}>
            View All →
          </button>
        )}

      </div>

      {riskItems.map(
        ([name, desc, val, level]) => (
          <button
            className="risk-row"
            key={name}
            onClick={onClick}
          >

            <span
              className={
                "badge " + level.toLowerCase()
              }
            >
              {level}
            </span>

            <span className="risk-name">
              <b>{name}</b>
              <small>{desc}</small>
            </span>

            <span className="bar">
              <i
                style={{
                  width: val + "%"
                }}
              ></i>
            </span>

            <em>{val}/100</em>

          </button>
        )
      )}

    </div>
  );
}

function Community({ posts, large, onClick }) {

  const data = posts.length
    ? posts
    : [
      {
        user: "Ananya S.",
        text: "My grandmother still paints Madhubani at home. Here's a short story about her work...",
        tag: "#Madhubani",
        img: IMG.madhubani,
        likes: 124
      },
      {
        user: "Rahul K.",
        text: "Visited a traditional boat making community in Kerala. The craftsmanship is incredible!",
        tag: "#LivingTraditions",
        img: IMG.harappa,
        likes: 98
      }
    ];

  return (
    <div
      className={
        large
          ? "panel community large"
          : "panel community"
      }
    >

      <div className="panel-head">

        <h2>◌ Community Voices</h2>

        <button onClick={onClick}>
          Post a Story ＋
        </button>

      </div>

      {data.slice(0, 4).map((p, i) => (
        <article
          className="post"
          key={i}
        >

          <img
            src={p.img || IMG.madhubani}
            alt=""
          />

          <div>

            <b>
              {p.user || "Heritage Explorer"}
            </b>

            <p>
              {p.text || p.story}
            </p>

            <small>
              ♥ {p.likes || 0}　♡ {p.comments || 8}　 {p.tag || "#LivingIndia"}
            </small>

          </div>

        </article>
      ))}

    </div>
  );
}

function Explore({ items, onOpen }) {

  return (
    <div className="page-wrap">

      <div className="page-title">

        <div className="eyebrow">
          EXPLORE INDIA
        </div>

        <h1>
          Stories worth <i>discovering</i>
        </h1>

        <p>
          From ancient cities to living crafts, explore the many threads of India's cultural memory.
        </p>

      </div>

      <div className="filter-row">

        <button className="selected">
          All
        </button>

        <button>
          Art & Craft
        </button>

        <button>
          Music
        </button>

        <button>
          Dance & Performance
        </button>

        <button>
          Food
        </button>

        <button>
          Archaeology
        </button>

      </div>

      <div className="explore-grid">

        {items.map(h => (
          <HeritageCard
            key={h.id}
            h={h}
            onClick={onOpen}
          />
        ))}

      </div>

    </div>
  );
}


/*
  REAL INDIA STATE MAP
  --------------------
  The map uses GeoJSON state/UT boundaries rather than manually positioned pins.
  Source: India states simplified GeoJSON (state-level boundaries).
  Keeping the URL here means no extra npm map library is required.
*/
const INDIA_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/AbhinavSwami28/india-official-geojson@main/india-states-simplified.geojson";

const MAP_VIEW = {
  minLon: 67,
  maxLon: 99,
  minLat: 5,
  maxLat: 38.5,
  width: 1000,
  height: 1100
};

const HERITAGE_CATEGORIES = [
  { id: "art", label: "Art", icon: "🎨", tone: "coral" },
  { id: "craft", label: "Craft", icon: "🏺", tone: "ochre" },
  { id: "music", label: "Music", icon: "🎵", tone: "teal" },
  { id: "dance", label: "Dance / Performance", icon: "💃", tone: "violet" },
  { id: "festival", label: "Festival", icon: "✺", tone: "saffron" },
  { id: "food", label: "Food", icon: "🍛", tone: "leaf" },
  { id: "architecture", label: "Architecture", icon: "🏛", tone: "rose" },
  { id: "language", label: "Language", icon: "अ", tone: "sky" },
  { id: "ritual", label: "Ritual / Tradition", icon: "🪔", tone: "sand" },
  { id: "history", label: "Historical Heritage", icon: "◉", tone: "indigo" }
];

const HERITAGE_UI_CSS = `
  .li-geo-map {
    position: relative;
    width: 100%;
    min-height: 520px;
    overflow: hidden;
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 40%, rgba(214, 158, 73, .12), transparent 48%),
      linear-gradient(135deg, #182522 0%, #0f1a18 100%);
    border: 1px solid rgba(205, 164, 92, .28);
    box-shadow: inset 0 0 90px rgba(0,0,0,.22), 0 20px 60px rgba(20,25,20,.14);
    touch-action: none;
    user-select: none;
  }

  .li-geo-map.full {
    min-height: min(760px, 72vh);
  }

  .li-geo-map svg {
    display: block;
    width: 100%;
    height: 100%;
    min-height: inherit;
  }

  .li-map-path {
    fill: #cfa86a;
    fill-opacity: .72;
    stroke: rgba(73, 53, 31, .85);
    stroke-width: 1.35;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
    transition: fill .18s ease, fill-opacity .18s ease, filter .18s ease;
  }

  .li-map-path:hover,
  .li-map-path.is-hovered {
    fill: #e6b968;
    fill-opacity: .98;
    filter: drop-shadow(0 0 9px rgba(236, 184, 93, .45));
  }

  .li-map-hint {
    position: absolute;
    left: 20px;
    top: 18px;
    padding: 9px 13px;
    border: 1px solid rgba(226, 194, 132, .22);
    border-radius: 999px;
    background: rgba(8, 18, 16, .62);
    color: rgba(250, 238, 211, .9);
    font-size: 12px;
    letter-spacing: .04em;
    backdrop-filter: blur(12px);
    pointer-events: none;
  }

  .li-map-controls {
    position: absolute;
    right: 18px;
    top: 18px;
    display: flex;
    gap: 7px;
    z-index: 3;
  }

  .li-map-controls button {
    width: 38px;
    height: 38px;
    border: 1px solid rgba(238, 214, 167, .25);
    border-radius: 12px;
    background: rgba(8, 18, 16, .7);
    color: #f4e5c5;
    font-size: 20px;
    cursor: pointer;
    backdrop-filter: blur(12px);
  }

  .li-map-controls button:hover {
    background: rgba(121, 61, 39, .9);
    transform: translateY(-1px);
  }

  .li-map-tooltip {
    position: absolute;
    z-index: 4;
    transform: translate(-50%, calc(-100% - 12px));
    padding: 7px 11px;
    border-radius: 10px;
    background: #fff5df;
    color: #4a281c;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(0,0,0,.22);
    pointer-events: none;
    white-space: nowrap;
  }

  .li-map-bottom-note {
    position: absolute;
    left: 50%;
    bottom: 14px;
    transform: translateX(-50%);
    color: rgba(246, 230, 198, .72);
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    pointer-events: none;
  }

  .li-category-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 22px;
    background: rgba(7, 13, 12, .78);
    backdrop-filter: blur(13px) saturate(.8);
    animation: liOverlayIn .22s ease both;
  }

  .li-category-modal {
    position: relative;
    width: min(1080px, 96vw);
    max-height: min(850px, 94vh);
    overflow: auto;
    display: grid;
    grid-template-columns: .78fr 1.22fr;
    border: 1px solid rgba(124, 74, 41, .28);
    border-radius: 30px;
    background:
      radial-gradient(circle at 78% 15%, rgba(194, 138, 60, .12), transparent 25%),
      linear-gradient(145deg, #fbf0d8 0%, #f4e3c2 100%);
    box-shadow: 0 35px 100px rgba(0,0,0,.48), inset 0 0 0 1px rgba(255,255,255,.35);
    animation: liModalIn .32s cubic-bezier(.2,.8,.2,1) both;
  }

  .li-category-modal::before {
    content: "";
    position: absolute;
    inset: 10px;
    border: 1px solid rgba(124, 74, 41, .16);
    border-radius: 23px;
    pointer-events: none;
  }

  .li-state-art {
    position: relative;
    min-height: 680px;
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 36px;
    background:
      radial-gradient(circle, rgba(201, 143, 65, .17), transparent 62%),
      linear-gradient(155deg, #ead1a2, #d8b477);
    border-radius: 29px 0 0 29px;
  }

  .li-state-art::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(117,57,35,.1) 0 2px, transparent 2.5px),
      radial-gradient(circle at 80% 75%, rgba(117,57,35,.08) 0 2px, transparent 2.5px);
    background-size: 26px 26px, 31px 31px;
    pointer-events: none;
  }

  .li-state-map-watermark {
    position: absolute;
    inset: 8%;
    width: 84%;
    height: 84%;
    opacity: .28;
    overflow: visible;
  }

  .li-state-map-watermark path {
    fill: rgba(124, 65, 39, .36);
    stroke: rgba(103, 51, 31, .58);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }

  .li-state-art-copy {
    position: relative;
    z-index: 2;
    align-self: end;
    width: 100%;
    color: #4e2d21;
  }

  .li-state-art-copy .mini-label {
    display: inline-block;
    margin-bottom: 10px;
    font-size: 11px;
    letter-spacing: .22em;
    font-weight: 800;
    text-transform: uppercase;
    opacity: .72;
  }

  .li-state-art-copy h3 {
    margin: 0;
    max-width: 350px;
    font-family: Georgia, serif;
    font-size: clamp(28px, 3vw, 46px);
    line-height: 1.02;
  }

  .li-state-art-copy p {
    max-width: 330px;
    margin: 14px 0 0;
    line-height: 1.65;
    color: rgba(78,45,33,.78);
  }

  .li-category-content {
    position: relative;
    z-index: 2;
    padding: 46px 48px 40px;
  }

  .li-category-close {
    position: absolute;
    right: 27px;
    top: 24px;
    z-index: 4;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: #743421;
    color: #fff4df;
    font-size: 25px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 7px 20px rgba(92,44,29,.2);
  }

  .li-category-close:hover {
    transform: rotate(5deg) scale(1.04);
    background: #8b3e28;
  }

  .li-category-eyebrow {
    margin-bottom: 8px;
    color: #875033;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .li-category-title {
    margin: 0;
    padding-right: 45px;
    color: #572b20;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(38px, 5vw, 64px);
    line-height: .98;
  }

  .li-category-rule {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 15px 0 10px;
    color: #9b613d;
  }

  .li-category-rule::before,
  .li-category-rule::after {
    content: "";
    height: 1px;
    flex: 1;
    background: rgba(130,75,47,.22);
  }

  .li-category-subtitle {
    margin: 0 0 23px;
    color: #795846;
    line-height: 1.55;
    font-size: 14px;
  }

  .li-category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px;
  }

  .li-category-card {
    position: relative;
    min-height: 78px;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 13px 15px;
    border: 1px solid rgba(119, 72, 45, .17);
    border-radius: 17px;
    color: #513026;
    background: rgba(255, 249, 235, .64);
    cursor: pointer;
    text-align: left;
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
  }

  .li-category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 22px rgba(101,61,39,.11);
    border-color: rgba(128, 68, 40, .32);
  }

  .li-category-card.selected {
    border-color: #8a3f28;
    background: linear-gradient(135deg, rgba(155,75,47,.17), rgba(230,187,111,.17));
    box-shadow: 0 0 0 2px rgba(138,63,40,.08), 0 9px 24px rgba(104,55,37,.12);
  }

  .li-category-card .cat-icon {
    flex: 0 0 43px;
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: rgba(255,255,255,.58);
    font-size: 22px;
    box-shadow: inset 0 0 0 1px rgba(102,64,40,.08);
  }

  .li-category-card .cat-label {
    font-family: Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.15;
  }

  .li-category-check {
    margin-left: auto;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border: 1.5px solid rgba(104,65,43,.35);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    transition: all .18s ease;
  }

  .li-category-card.selected .li-category-check {
    border-color: #7d3524;
    background: #7d3524;
    box-shadow: 0 3px 8px rgba(106,48,34,.22);
  }

  .li-category-card.selected .li-category-check::after {
    content: "✓";
  }

  .li-category-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 25px;
  }

  .li-category-count {
    color: #856451;
    font-size: 12px;
  }

  .li-category-continue {
    min-width: 190px;
    padding: 13px 22px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, #7d3524, #a54c31);
    color: #fff8e9;
    font-family: Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(116,48,33,.22);
    transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
  }

  .li-category-continue:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 27px rgba(116,48,33,.28);
  }

  .li-category-continue:disabled {
    opacity: .45;
    cursor: not-allowed;
    box-shadow: none;
  }

  @keyframes liOverlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes liModalIn {
    from { opacity: 0; transform: translateY(18px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 820px) {
    .li-category-modal {
      grid-template-columns: 1fr;
      max-height: 94vh;
    }

    .li-state-art {
      min-height: 230px;
      max-height: 280px;
      padding: 26px;
      border-radius: 29px 29px 0 0;
    }

    .li-state-map-watermark {
      inset: 5%;
      width: 90%;
      height: 90%;
    }

    .li-state-art-copy {
      align-self: end;
    }

    .li-state-art-copy h3 {
      font-size: 34px;
    }

    .li-state-art-copy p {
      display: none;
    }

    .li-category-content {
      padding: 30px 24px 27px;
    }

    .li-category-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 540px) {
    .li-geo-map {
      min-height: 440px;
      border-radius: 20px;
    }

    .li-category-overlay {
      padding: 10px;
    }

    .li-category-modal {
      border-radius: 23px;
    }

    .li-category-grid {
      grid-template-columns: 1fr;
    }

    .li-category-card {
      min-height: 68px;
    }

    .li-category-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .li-category-continue {
      width: 100%;
    }

    .li-category-count {
      text-align: center;
    }
  }
`;

function getGeoName(feature) {
  const p = feature?.properties || {};
  return (
    p.State_Name ||
    p.STATE_NAME ||
    p.ST_NM ||
    p.st_nm ||
    p.name ||
    p.NAME_1 ||
    p.NAME ||
    p.state ||
    p.State ||
    "Unknown State"
  );
}

function projectPoint([lon, lat]) {
  return [
    ((lon - MAP_VIEW.minLon) / (MAP_VIEW.maxLon - MAP_VIEW.minLon)) * MAP_VIEW.width,
    ((MAP_VIEW.maxLat - lat) / (MAP_VIEW.maxLat - MAP_VIEW.minLat)) * MAP_VIEW.height
  ];
}

function ringToSvgPath(ring) {
  if (!Array.isArray(ring) || !ring.length) return "";
  return ring
    .map((point, index) => {
      const [x, y] = projectPoint(point);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function geometryToSvgPath(geometry) {
  if (!geometry) return "";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringToSvgPath).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map(polygon => polygon.map(ringToSvgPath).join(" "))
      .join(" ");
  }

  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.map(geometryToSvgPath).join(" ");
  }

  return "";
}

function geometryBounds(geometry) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visit = coords => {
    if (!Array.isArray(coords)) return;

    if (
      coords.length >= 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      const [x, y] = projectPoint(coords);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      return;
    }

    coords.forEach(visit);
  };

  if (geometry?.type === "GeometryCollection") {
    geometry.geometries.forEach(g => visit(g.coordinates));
  } else {
    visit(geometry?.coordinates);
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 1100 };
  }

  return { minX, minY, maxX, maxY };
}

function stateFeatureKey(feature, index) {
  const p = feature?.properties || {};
  return (
    p.ID ||
    p.id ||
    p.STATE_ID ||
    p.state_id ||
    p.ISO ||
    p.iso ||
    `${getGeoName(feature)}-${index}`
  );
}

function CulturalMap({ full, onStateSelect }) {
  const [geojson, setGeojson] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const drag = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    let alive = true;

    fetch(INDIA_GEOJSON_URL)
      .then(r => {
        if (!r.ok) throw new Error(`Map request failed: ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!alive) return;
        const features = Array.isArray(data?.features)
          ? data.features
          : [];

        setGeojson({
          ...data,
          features
        });
      })
      .catch(() => {
        if (alive) {
          setLoadError(
            "The geographic map could not be loaded. Please refresh once."
          );
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const features = geojson?.features || [];

  const changeZoom = amount => {
    setZoom(value => Math.min(6, Math.max(1, value + amount)));
  };

  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const startDrag = e => {
    drag.current = {
      active: true,
      moved: false,
      x: e.clientX,
      y: e.clientY
    };

    // Intentionally do not capture the pointer here. State SVG paths
    // need to receive their own pointer/click events.
  };

  const moveDrag = e => {
    if (!drag.current.active) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = MAP_VIEW.width / Math.max(rect.width, 1);
    const scaleY = MAP_VIEW.height / Math.max(rect.height, 1);

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    if (Math.abs(dx) + Math.abs(dy) > 3) {
      drag.current.moved = true;
    }

    setPan(current => ({
      x: current.x + (dx * scaleX) / zoom,
      y: current.y + (dy * scaleY) / zoom
    }));

    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const handleWheel = e => {
    e.preventDefault();
    changeZoom(e.deltaY > 0 ? -0.18 : 0.18);
  };

  return (
    <>
      <style>{HERITAGE_UI_CSS}</style>

      <div
        className={full ? "li-geo-map full" : "li-geo-map"}
        onWheel={handleWheel}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          setHovered(null);
          setTooltip(null);
        }}
      >
        <div className="li-map-hint">
          Drag to explore · Scroll to zoom
        </div>

        <div className="li-map-controls">
          <button
            type="button"
            aria-label="Zoom in"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => changeZoom(0.45)}
          >
            +
          </button>

          <button
            type="button"
            aria-label="Zoom out"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => changeZoom(-0.45)}
          >
            −
          </button>

          <button
            type="button"
            aria-label="Reset map"
            onPointerDown={e => e.stopPropagation()}
            onClick={resetMap}
          >
            ↺
          </button>
        </div>

        {loadError ? (
          <div
            style={{
              height: "100%",
              minHeight: "inherit",
              display: "grid",
              placeItems: "center",
              padding: 30,
              color: "#f4e5c5",
              textAlign: "center"
            }}
          >
            {loadError}
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
            role="img"
            aria-label="Interactive map of Indian states and union territories"
          >
            <defs>
              <filter id="li-map-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="4"
                  floodColor="#2d2116"
                  floodOpacity=".35"
                />
              </filter>
            </defs>

            <rect
              width={MAP_VIEW.width}
              height={MAP_VIEW.height}
              fill="transparent"
            />

            <g
              transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}
              filter="url(#li-map-shadow)"
            >
              {features.map((feature, index) => {
                const name = getGeoName(feature);
                const path = geometryToSvgPath(feature.geometry);

                if (!path) return null;

                return (
                  <path
                    key={stateFeatureKey(feature, index)}
                    d={path}
                    className={
                      hovered?.name === name
                        ? "li-map-path is-hovered"
                        : "li-map-path"
                    }
                    onMouseEnter={e => {
                      setHovered({ name });
                      const rect = e.currentTarget
                        .ownerSVGElement
                        ?.getBoundingClientRect();

                      if (rect) {
                        setTooltip({
                          name,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                      }
                    }}
                    onMouseMove={e => {
                      const rect = e.currentTarget
                        .ownerSVGElement
                        ?.getBoundingClientRect();

                      if (rect) {
                        setTooltip({
                          name,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      setTooltip(null);
                    }}
                    onPointerDown={e => {
                      // Stop the map's drag handler from taking ownership of
                      // a direct state tap/click.
                      e.stopPropagation();
                      drag.current.active = false;
                      drag.current.moved = false;
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setTooltip(null);
                      setHovered(null);
                      onStateSelect?.({
                        name,
                        feature
                      });
                    }}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {tooltip && (
          <div
            className="li-map-tooltip"
            style={{
              left: tooltip.x,
              top: tooltip.y
            }}
          >
            {tooltip.name}
          </div>
        )}

        <div className="li-map-bottom-note">
          States &amp; Union Territories · click any region to begin
        </div>
      </div>
    </>
  );
}

function HeritageCategoryModal({ state, onClose, onContinue }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    setSelectedCategories([]);
  }, [state]);

  if (!state?.feature) return null;

  const path = geometryToSvgPath(state.feature.geometry);
  const bounds = geometryBounds(state.feature.geometry);
  const width = Math.max(bounds.maxX - bounds.minX, 1);
  const height = Math.max(bounds.maxY - bounds.minY, 1);
  const scale = Math.min(14, 760 / Math.max(width, height));
  const centeredX = 500 - (bounds.minX + width / 2) * scale;
  const centeredY = 420 - (bounds.minY + height / 2) * scale;

  const toggleCategory = id => {
    setSelectedCategories(current =>
      current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]
    );
  };

  const continueSelection = () => {
    if (!selectedCategories.length) return;

    const labels = HERITAGE_CATEGORIES
      .filter(category => selectedCategories.includes(category.id))
      .map(category => category.label);

    onContinue?.(labels);
  };

  return (
    <>
      <style>{HERITAGE_UI_CSS}</style>

      <div
        className="li-category-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${state.name} heritage categories`}
      >
        <div
          className="li-category-modal"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            className="li-category-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>

          <section className="li-state-art">
            <svg
              className="li-state-map-watermark"
              viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
              aria-hidden="true"
            >
              <g
                transform={`translate(${centeredX} ${centeredY}) scale(${scale})`}
              >
                <path d={path} />
              </g>
            </svg>

            <div className="li-state-art-copy">
              <span className="mini-label">A Living India · State Heritage</span>
              <h3>Explore the stories that belong to {state.name}.</h3>
              <p>
                Choose the heritage categories you want to explore, document or
                contribute to.
              </p>
            </div>
          </section>

          <section className="li-category-content">
            <div className="li-category-eyebrow">
              Selected region · {state.name}
            </div>

            <h2 className="li-category-title">{state.name}</h2>

            <div className="li-category-rule">
              <span>✦</span>
            </div>

            <p className="li-category-subtitle">
              What kind of living heritage are you looking for?
              <br />
              Select one or more paths.
            </p>

            <div className="li-category-grid">
              {HERITAGE_CATEGORIES.map(category => {
                const isSelected = selectedCategories.includes(category.id);

                return (
                  <button
                    type="button"
                    key={category.id}
                    className={
                      isSelected
                        ? "li-category-card selected"
                        : "li-category-card"
                    }
                    onClick={() => toggleCategory(category.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="cat-icon">{category.icon}</span>
                    <span className="cat-label">{category.label}</span>
                    <span className="li-category-check" aria-hidden="true">
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="li-category-footer">
              <span className="li-category-count">
                {selectedCategories.length
                  ? `${selectedCategories.length} ${
                      selectedCategories.length === 1 ? "category" : "categories"
                    } selected`
                  : "Choose at least one category"}
              </span>

              <button
                type="button"
                className="li-category-continue"
                disabled={!selectedCategories.length}
                onClick={continueSelection}
              >
                Continue →
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Detail({ h, close, onContribute }) {

  return (
    <div
      className="detail-overlay"
      onClick={close}
    >

      <div
        className="detail"
        onClick={e => e.stopPropagation()}
      >

        <button
          className="close"
          onClick={close}
        >
          ×
        </button>

        <div className="detail-image">

          <img
            src={h.image}
            alt=""
          />

          <div>
            <span>{h.type}</span>
            <span>{h.period}</span>
          </div>

        </div>

        <div className="detail-body">

          <div className="eyebrow">
            {h.place}
          </div>

          <h1>
            {h.title}
          </h1>

          <p className="lead">
            {h.desc}
          </p>

          <div className="fact-grid">

            {(h.facts || []).map(x => (
              <div key={x}>
                <span>✦</span>
                {x}
              </div>
            ))}

          </div>

          <div className="detail-actions">

            <button
              className="primary"
              onClick={onContribute}
            >
              Add your story ＋
            </button>

            <button
              className="outline"
              onClick={close}
            >
              Continue exploring
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

function Modal({ type, close, notify }) {

  const contribute = type === "contribute";
  const experience =
    type && type.type === "experience";

  if (!contribute && !experience)
    return null;

  if (experience) {

    const data =
      experienceDetails[type.id] ||
      [
        "Heritage Experience",
        "This interaction is planned as part of the Living India experience layer."
      ];

    return (
      <div
        className="modal-overlay"
        onClick={close}
      >

        <div
          className="modal feature-modal"
          onClick={e => e.stopPropagation()}
        >

          <button
            className="close"
            onClick={close}
          >
            ×
          </button>

          <div className="eyebrow">
            COMING TO LIVING INDIA
          </div>

          <h2>
            {data[0]}
          </h2>

          <p>
            {data[1]}
          </p>

          <div className="feature-preview">

            <span>✦</span>

            <b>
              Interactive module
            </b>

            <small>
              Option added · full interaction will be implemented next
            </small>

          </div>

          <button
            className="primary"
            onClick={close}
          >
            Back to exploring →
          </button>

        </div>

      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={close}
    >

      <div
        className="modal"
        onClick={e => e.stopPropagation()}
      >

        <button
          className="close"
          onClick={close}
        >
          ×
        </button>

        <div className="eyebrow">
          COMMUNITY ARCHIVE
        </div>

        <h2>
          Share a living story
        </h2>

        <p>
          Your memory, craft, recipe, song or local tradition can become part of India's digital heritage.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            close();
            notify("Story submitted for review ✓");
          }}
        >

          <input
            name="title"
            required
            placeholder="Story title"
          />

          <input
            name="topic"
            placeholder="Place or tradition"
          />

          <textarea
            name="story"
            required
            placeholder="Tell us the story..."
          />

          <button
            className="primary"
            type="submit"
          >
            Submit for review →
          </button>

        </form>

      </div>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <App />
);
