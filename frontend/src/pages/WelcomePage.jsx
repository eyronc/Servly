import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../components/Logo';

export default function WelcomePage({ setPage, setTableNumber, apiBaseUrl, sessionId }) {
  const [tableCount, setTableCount] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTable, setHoveredTable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, sessionsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/settings`),
          axios.get(`${apiBaseUrl}/api/sessions`)
        ]);
        setTableCount(parseInt(settingsRes.data.table_count, 10) || 5);
        
        // Find tables occupied by other sessions
        const occupied = sessionsRes.data
          .filter(s => s.session_id !== sessionId)
          .map(s => s.table_number);
        setOccupiedTables(occupied);
      } catch (err) {
        console.error('Error fetching welcome page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll active sessions every 5s to keep occupied tables updated in real-time
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/sessions`);
        const occupied = res.data
          .filter(s => s.session_id !== sessionId)
          .map(s => s.table_number);
        setOccupiedTables(occupied);
      } catch (err) {
        console.error('Error polling sessions:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [apiBaseUrl, sessionId]);

  const handleSelectTable = async (num) => {
    // Register / update the session with the new table number
    try {
      await axios.post(`${apiBaseUrl}/api/sessions`, {
        session_id: sessionId,
        table_number: num,
      });
    } catch (e) {
      console.warn('Could not register session:', e);
    }
    setTableNumber(String(num));
    setPage('menu');
  };

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(245,158,11,0.18) 0%, transparent 60%),' +
          'radial-gradient(ellipse 60% 40% at 80% 90%, rgba(180,83,9,0.1) 0%, transparent 50%),' +
          '#fafaf8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        minHeight: '100svh',
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fffdf7',
          border: '1px solid rgba(245,158,11,0.18)',
          borderRadius: 32,
          boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
          padding: '40px 32px 36px',
        }}
      >
        {/* Logo + Welcome */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo size={48} showText={false} />
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: '#0c0c0f',
              letterSpacing: '-0.03em',
              marginBottom: 8,
            }}
          >
            Welcome to Servly
          </h1>
          <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.6 }}>
            Select your table to begin ordering.
          </p>
        </div>

        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#a8a29e',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          Available Tables
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="skeleton" style={{ height: 80, borderRadius: 18 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
            {tables.map(num => {
              const isOccupied = occupiedTables.includes(num);
              const isHovered = hoveredTable === num && !isOccupied;

              let bg = 'rgba(255,255,255,0.8)';
              let border = '1.5px solid rgba(0,0,0,0.08)';
              let shadow = '0 2px 8px rgba(0,0,0,0.04)';
              let transform = 'translateY(0)';
              let cursor = 'pointer';

              if (isOccupied) {
                bg = 'rgba(240, 240, 238, 0.6)'; // disabled stone gray
                border = '1.5px dashed rgba(0,0,0,0.12)';
                shadow = 'none';
                cursor = 'not-allowed';
              } else if (isHovered) {
                bg = 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))';
                border = '2px solid rgba(245,158,11,0.7)';
                shadow = '0 6px 24px rgba(245,158,11,0.2)';
                transform = 'translateY(-3px)';
              }

              return (
                <button
                  key={num}
                  id={`table-btn-${num}`}
                  onClick={() => !isOccupied && handleSelectTable(num)}
                  disabled={isOccupied}
                  onMouseEnter={() => !isOccupied && setHoveredTable(num)}
                  onMouseLeave={() => !isOccupied && setHoveredTable(null)}
                  className={isOccupied ? "" : "press-effect"}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    height: 84,
                    borderRadius: 18,
                    border,
                    background: bg,
                    boxShadow: shadow,
                    transform,
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                    cursor,
                  }}
                >
                  {/* Occupied Red Dot */}
                  {isOccupied && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                      }}
                    />
                  )}

                  {/* Chair SVG */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="3" width="14" height="9" rx="3" fill={isOccupied ? '#d6d3d1' : (isHovered ? '#f59e0b' : '#d6d3d1')} />
                    <rect x="3" y="12" width="18" height="3" rx="1.5" fill={isOccupied ? '#a8a29e' : (isHovered ? '#d97706' : '#a8a29e')} />
                    <line x1="8" y1="15" x2="8" y2="21" stroke={isOccupied ? '#a8a29e' : (isHovered ? '#b45309' : '#a8a29e')} strokeWidth="2" strokeLinecap="round" />
                    <line x1="16" y1="15" x2="16" y2="21" stroke={isOccupied ? '#a8a29e' : (isHovered ? '#b45309' : '#a8a29e')} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800,
                      fontSize: 13,
                      color: isOccupied ? '#a8a29e' : (isHovered ? '#92400e' : '#3d3d3d'),
                      transition: 'color 0.2s ease',
                      marginTop: 2,
                    }}
                  >
                    {num}
                  </span>

                  {isOccupied && (
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#ef4444',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        marginTop: -2,
                      }}
                    >
                      Occupied
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#c4bfb8', marginTop: 28 }}>
          Or scan the QR code at your table to auto-select.
        </p>
      </div>
    </div>
  );
}
