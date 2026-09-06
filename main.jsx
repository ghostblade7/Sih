import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { subscribeToAuth } from './firebase.js';
import './style.css';
import { Menu, Search, User } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      {/* Navigation Layer */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 5%', alignItems: 'center', borderBottom: '1px solid var(--border-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-teal)' }}>
            <Menu size={28} />
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>Living India</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Search size={24} color="var(--primary-teal)" style={{ cursor: 'pointer' }} />
          
          {/* Dynamic Auth Button */}
          {authLoaded && (
            <a 
              href={user ? "/profile.html" : "/auth.html"} 
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={18} />
              {user ? "Profile" : "Login"}
            </a>
          )}
        </div>
      </nav>

      {/* Burger Menu Overlay */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '300px', height: '100vh', backgroundColor: 'var(--bg-ivory)', zIndex: 1000, padding: '24px', boxShadow: '2px 0 12px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--accent-terracotta)' }}>✕ Close</button>
          <ul style={{ listStyle: 'none', marginTop: '40px', lineHeight: '2.5', fontFamily: 'var(--font-sans)', fontSize: '18px' }}>
            <li><a href="#explore" style={{ color: 'var(--text-brown)', textDecoration: 'none' }}>Explore Heritage</a></li>
            <li><a href="#map" style={{ color: 'var(--text-brown)', textDecoration: 'none' }}>India Map</a></li>
            <li><a href="#experiences" style={{ color: 'var(--text-brown)', textDecoration: 'none' }}>Experiences</a></li>
            <li><a href="#risk" style={{ color: 'var(--text-brown)', textDecoration: 'none' }}>Heritage at Risk</a></li>
          </ul>
        </div>
      )}

      {/* Hero Section */}
      <header style={{ padding: '120px 5%', textAlign: 'center', backgroundColor: 'var(--primary-teal)', color: 'var(--bg-parchment)' }}>
        <h2 style={{ fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted-gold)', marginBottom: '16px' }}>Explore • Experience • Connect</h2>
        <h1 style={{ fontSize: '48px', color: 'var(--bg-ivory)', marginBottom: '24px' }}>Same Roots. A Thousand Stories. One India.</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '18px', fontFamily: 'var(--font-sans)', lineHeight: '1.6', opacity: 0.9 }}>
          Immerse yourself in the architecture, arts, and traditions that shape our heritage.
        </p>
      </header>

      {/* Heritage Categories */}
      <section id="explore" style={{ padding: '80px 5%' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>Discover by Category</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* Example Cards */}
          {['Dance', 'Architecture', 'Textiles', 'Spiritual Traditions'].map(cat => (
            <div key={cat} className="heritage-card" style={{ padding: '32px', textAlign: 'center' }}>
              <h4 style={{ color: 'var(--accent-rust)', fontSize: '20px' }}>{cat}</h4>
              <p style={{ marginTop: '12px', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>Explore the rich {cat.toLowerCase()} of India.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Placeholder */}
      <section id="map" style={{ padding: '80px 5%', backgroundColor: 'var(--bg-ivory)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>Interactive India Map</h3>
        <div className="ornamental-border" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-parchment)' }}>
           <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--primary-teal)' }}>[ react-simple-maps TopoJSON Implementation Goes Here ]</p>
        </div>
      </section>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
