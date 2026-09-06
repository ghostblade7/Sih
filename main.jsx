import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { subscribeToAuth } from './firebase.js';
import { supabase } from './supabase.js';
import './style.css';
import { Search, User, Moon, ArrowRight } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [heritage, setHeritage] = useState([]);

useEffect(() => {
  const loadHeritage = async () => {
    const { data, error } = await supabase
      .from('Heritage')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log('Heritage data:', data);
    setHeritage(data || []);
  };

  loadHeritage();
}, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const experiences = [
    { title: "Interactive Explorer", desc: "Explore India's heritage on a dynamic map.", color: "var(--accent-rust)" },
    { title: "Heritage Gallery", desc: "Discover captivating stories through art.", color: "var(--btn-green)" },
    { title: "Timeline", desc: "Walk through India's journey across time.", color: "var(--accent-gold)" },
    { title: "How It's Made", desc: "See the process, meet the craftsmanship.", color: "var(--btn-green)" },
    { title: "Culture Connections", desc: "Find links between people and places.", color: "var(--accent-rust)" },
    { title: "You Might Be Surprised", desc: "Amazing facts and untold stories.", color: "var(--accent-gold)" },
    { title: "Quiz", desc: "Test what you've learned and have fun!", color: "var(--btn-green)" },
    { title: "Listen & Explore", desc: "Hear the sounds of India's cultures.", color: "var(--accent-rust)" },
    { title: "Before & After", desc: "See how places have evolved.", color: "var(--btn-green)" },
    { title: "Heritage Passport", desc: "Complete challenges and collect stamps.", color: "var(--accent-gold)" }
  ];

  return (
    <div style={{ padding: '0 4%' }}>
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--accent-gold)' }}>[Logo Icon]</div>
          <div>
            <h1 style={{ fontSize: '20px', letterSpacing: '1px', margin: 0 }}>LIVING INDIA</h1>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#666', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>People • Places • Stories</p>
          </div>
        </div>
        
        <div className="search-container">
          <Search size={18} color="#666" />
          <input type="text" placeholder="Search a heritage, art form, place, or story..." />
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Explore</a>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>About</a>
          <a href="#" style={{ textDecoration: 'none', color: 'var(--text-dark)' }}>Resources</a>
          
          {authLoaded && (
            <a href={user ? "/profile.html" : "/auth.html"} className="btn-primary" style={{ textDecoration: 'none' }}>
              {user ? "Profile" : "Login"}
            </a>
          )}
          <button style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}><Moon size={16} /></button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '60px 0 100px 0' }}>
        <div style={{ maxWidth: '500px' }}>
          <h1 style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '16px' }}>Explore India's<br/>Living Heritage</h1>
          <p style={{ fontSize: '20px', marginBottom: '32px' }}>Art forms. Stories. People. Places.</p>
          
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px', color: '#444' }}>
            Journey through the diverse cultures, traditions and histories that make India extraordinary.
          </p>

          <div style={{ borderLeft: '2px solid var(--accent-gold)', paddingLeft: '16px', fontStyle: 'italic', color: '#555' }}>
            <p>“A civilization is not what it leaves in its museums, but what it lives in its people.”</p>
            <p style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'normal', letterSpacing: '1px' }}>— UNKNOWN</p>
          </div>
        </div>

        {/* Map / Illustration Placeholder */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-script)', fontSize: '42px', color: 'var(--text-dark)', transform: 'rotate(-5deg)' }}>
              Many Cultures<br/>One Incredible<br/>India
            </p>
          </div>
        </div>
      </header>

      {/* 10 WAYS GRID */}
      <section style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#d0c6b4' }}></div>
          <h3 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>Ten Ways to Experience Heritage</h3>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#d0c6b4' }}></div>
        </div>

        <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '20px'
  }}
>
  {experiences.map((exp, idx) => (
    <div key={idx} className="experience-card">
      <div className="card-img-placeholder"></div>

      <div
        style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>
          {exp.title}
        </h4>

        <p
          style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '16px',
            flex: 1
          }}
        >
          {exp.desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-icon"
            style={{ backgroundColor: exp.color }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  ))}

  {heritage.map((item) => (
    <div key={item.id} className="experience-card">
      <div
        className="card-img-placeholder"
        style={{
          backgroundImage: item.image_url
            ? `url(${item.image_url})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      <div
        style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>
          {item.title}
        </h4>

        <p
          style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '16px',
            flex: 1
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  ))}
</div>
        </div>
      </section>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
