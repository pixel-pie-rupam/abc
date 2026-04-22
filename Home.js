import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, getWorkshops, joinWorkshop } from '../utils/api';

/* ─────────────────────────────────────────
   Category map (unchanged)
───────────────────────────────────────── */
const CAT_MAP = {
  aws:                  { label: 'AWS Cloud',       icon: '☁️',  color: '#ff9900' },
  azure:                { label: 'Microsoft Azure', icon: '🔷', color: '#0078d4' },
  cybersecurity:        { label: 'Cybersecurity',   icon: '🛡️',  color: '#ff4757' },
  soc:                  { label: 'SOC Operations',  icon: '🔍', color: '#00d4a1' },
  'pentesting-web':     { label: 'Web Pentesting',  icon: '🕸️',  color: '#ffa502' },
  'pentesting-network': { label: 'Network Pentest', icon: '🌐', color: '#ff6b35' },
  'pentesting-api':     { label: 'API Pentesting',  icon: '⚡', color: '#a29bfe' },
  networking:           { label: 'Networking',      icon: '📡', color: '#6c47ff' },
};

/* ─────────────────────────────────────────
   Hero inline styles (keeps CSS class names
   from your existing stylesheet working too)
───────────────────────────────────────── */
const S = {
  heroSection: {
    position: 'relative',
    overflow: 'hidden',
    background: '#ecedf6',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage:
      'linear-gradient(rgba(108,71,255,0.07) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(108,71,255,0.07) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    zIndex: 0,
  },
  glowLeft: {
    position: 'absolute',
    top: -140,
    left: -120,
    width: 560,
    height: 560,
    background: 'radial-gradient(circle, rgba(108,71,255,0.14) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 460,
    height: 460,
    background: 'radial-gradient(circle, rgba(0,200,122,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    minHeight: 'calc(100vh - 0px)',
    padding: '0 5% 0 5%',
    gap: 0,
    flex: 1,
  },
  /* ── left column ── */
  heroLeft: {
    paddingTop: 64,
    paddingBottom: 80,
  },
  eyebrowPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    border: '1px solid #e2e2ee',
    borderRadius: 24,
    padding: '7px 18px',
    fontSize: 13,
    color: '#444',
    fontWeight: 500,
    marginBottom: 28,
    boxShadow: '0 1px 6px rgba(108,71,255,0.08)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#00c87a',
    flexShrink: 0,
    display: 'inline-block',
  },
  h1: {
    fontSize: 'clamp(36px, 4.4vw, 62px)',
    fontWeight: 900,
    lineHeight: 1.07,
    color: '#0d0d1e',
    marginBottom: 22,
    letterSpacing: '-1.5px',
  },
  gradPurple: {
    background: 'linear-gradient(90deg, #6c47ff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  gradTeal: {
    background: 'linear-gradient(90deg, #00c87a 0%, #00b4d8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroDesc: {
    fontSize: 16,
    color: '#5a5a72',
    lineHeight: 1.75,
    maxWidth: 440,
    marginBottom: 36,
  },
  heroActions: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 52,
  },
  stats: {
    display: 'flex',
    gap: 36,
    flexWrap: 'wrap',
  },
  statNum: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: '-1px',
    lineHeight: 1,
    background: 'linear-gradient(90deg, #6c47ff, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLbl: {
    fontSize: 12,
    color: '#9090aa',
    fontWeight: 500,
    marginTop: 4,
  },

  /* ── right column ── */
  heroRight: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 560,
    paddingBottom: 0,
  },

  /* glass platform */
  platformOuter: {
    position: 'absolute',
    bottom: 36,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 400,
    height: 62,
    borderRadius: 18,
    background: 'rgba(210,220,255,0.32)',
    border: '1px solid rgba(255,255,255,0.75)',
    backdropFilter: 'blur(6px)',
    zIndex: 2,
  },
  platformInner: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 340,
    height: 16,
    borderRadius: 10,
    background: 'rgba(190,205,255,0.22)',
    zIndex: 2,
  },

  /* the people image */
  peopleImg: {
    position: 'absolute',
    bottom: 58,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 430,
    height: 'auto',
    objectFit: 'contain',
    /*
      drop-shadow respects PNG transparency.
      First shadow = soft purple halo around figures.
      Second shadow = dark ground shadow beneath feet.
    */
    filter:
      'drop-shadow(0px 0px 32px rgba(108,71,255,0.22)) ' +
      'drop-shadow(0px 28px 18px rgba(60,40,120,0.18))',
    zIndex: 3,
    userSelect: 'none',
    pointerEvents: 'none',
  },

  /* floating info badges */
  badge: {
    position: 'absolute',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(220,220,240,0.9)',
    padding: '10px 14px',
    boxShadow: '0 4px 20px rgba(60,40,120,0.10)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    fontWeight: 600,
    color: '#1a1a2e',
    zIndex: 10,
    backdropFilter: 'blur(8px)',
    background: 'rgba(255,255,255,0.92)',
  },
  badgeIconWrap: (bg) => ({
    width: 32,
    height: 32,
    borderRadius: 9,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    flexShrink: 0,
  }),
  badgeSubtitle: {
    fontSize: 11,
    color: '#9090aa',
    fontWeight: 400,
    marginBottom: 1,
  },
};

/* ─────────────────────────────────────────
   Course card (unchanged logic)
───────────────────────────────────────── */
function CourseCard({ course }) {
  const navigate = useNavigate();
  const cat = CAT_MAP[course.category] || {};
  return (
    <div className="card course-card" onClick={() => navigate(`/courses/${course.slug}`)}>
      <div className="course-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="course-thumb-placeholder">{cat.icon || '📚'}</div>}
      </div>
      <div className="course-body">
        <div className="course-meta">
          <span className="tag" style={{ color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` }}>
            {cat.icon} {cat.label}
          </span>
          <span className="tag">{course.level}</span>
        </div>
        <div className="course-title">{course.title}</div>
        <div className="course-desc">{course.description}</div>
        <div className="course-footer">
          <div className="course-trainer">
            {course.trainer?.photo
              ? <img src={course.trainer.photo} alt={course.trainer.name} />
              : <span style={{ width:24,height:24,borderRadius:'50%',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--accent2)',fontWeight:700 }}>
                  {(course.trainer?.name||'P')[0]}
                </span>}
            {course.trainer?.name || 'Pragni'}
          </div>
          {course.price === 0
            ? <span className="price-free tag free">FREE</span>
            : <span className="price-paid">₹{course.price}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Workshop banner (unchanged logic)
───────────────────────────────────────── */
function WorkshopBanner({ workshop, onClick }) {
  const d = new Date(workshop.scheduledAt);
  const dateStr = d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  return (
    <div className="workshop-banner" onClick={onClick}>
      {workshop.bannerImage && <img className="workshop-banner-img" src={workshop.bannerImage} alt={workshop.title} />}
      <div className="workshop-banner-body">
        <div className="workshop-meta">
          <span className="live-badge"><span className="live-dot" />LIVE</span>
          <span className="tag">{dateStr} · {timeStr}</span>
        </div>
        <div className="workshop-title">{workshop.title}</div>
        <div className="workshop-desc">{workshop.description}</div>
        <button className="btn btn-primary btn-sm">Join Now →</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main page component
───────────────────────────────────────── */
export default function Home() {
  const [courses,         setCourses]         = useState([]);
  const [workshops,       setWorkshops]       = useState([]);
  const [selectedWorkshop,setSelectedWorkshop]= useState(null);
  const [joinForm,        setJoinForm]        = useState({ name:'', email:'', mobile:'' });
  const [joinLoading,     setJoinLoading]     = useState(false);
  const [joinResult,      setJoinResult]      = useState(null);
  const [joinError,       setJoinError]       = useState('');

  useEffect(() => {
    getCourses().then(r  => setCourses(r.data.courses   || [])).catch(() => {});
    getWorkshops().then(r => setWorkshops(r.data.workshops || [])).catch(() => {});
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinLoading(true); setJoinError('');
    try {
      const r = await joinWorkshop(selectedWorkshop._id, joinForm);
      setJoinResult(r.data.meetUrl);
    } catch (err) {
      setJoinError(err.response?.data?.error || 'Something went wrong. Try again.');
    }
    setJoinLoading(false);
  };

  const closeModal = () => {
    setSelectedWorkshop(null);
    setJoinResult(null);
    setJoinError('');
    setJoinForm({ name:'', email:'', mobile:'' });
  };

  return (
    <>
      {/* ══════════════════════════════════════
          HERO  — pixel-perfect rebuild
      ══════════════════════════════════════ */}
      <section style={S.heroSection}>

        {/* decorative layers */}
        <div style={S.gridBg} />
        <div style={S.glowLeft} />
        <div style={S.glowRight} />

        {/* two-column layout */}
        <div style={S.heroInner}>

          {/* ── LEFT ── */}
          <div style={S.heroLeft}>

            {/* eyebrow pill */}
            <div style={S.eyebrowPill} className="animate-fadeUp">
              <span style={S.liveDot} />
              Free courses live now — 2 new videos every week
            </div>

            {/* headline */}
            <h1 style={S.h1} className="animate-fadeUp delay-1">
              Learn <span style={S.gradPurple}>Cybersecurity</span>
              <br />
              &amp; <span style={S.gradTeal}>Cloud.</span> For Free.
            </h1>

            {/* sub-copy */}
            <p style={S.heroDesc} className="animate-fadeUp delay-2">
              Pragni is built to make world-class tech skills accessible to everyone.
              AWS, Azure, SOC, Pentesting, Networking — free and affordable, always.
            </p>

            {/* CTA buttons */}
            <div style={S.heroActions} className="animate-fadeUp delay-3">
              <Link to="/courses" className="btn btn-primary btn-lg">Browse Courses →</Link>
              <Link to="/workshops" className="btn btn-outline btn-lg">Live Workshops</Link>
            </div>

            {/* stats row */}
            <div style={S.stats} className="animate-fadeUp delay-4">
              {[['8+','Course tracks'],['100%','Free to start'],['2/wk','New videos'],['0','Hidden fees']].map(([num, lbl]) => (
                <div key={lbl}>
                  <div style={S.statNum}>{num}</div>
                  <div style={S.statLbl}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={S.heroRight}>

            {/* floating badge — top-left: AWS */}
            <div style={{ ...S.badge, top: 80, left: 0 }}>
              <div style={S.badgeIconWrap('#fff4e0')}>☁️</div>
              <div>
                <div style={S.badgeSubtitle}>Top Course</div>
                AWS Cloud
              </div>
            </div>

            {/* floating badge — middle-right: 100% Free (dark) */}
            <div style={{
              ...S.badge,
              top: 185,
              right: 0,
              background: 'rgba(15,15,30,0.92)',
              border: '1px solid rgba(108,71,255,0.3)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(108,71,255,0.20)',
            }}>
              <div style={S.badgeIconWrap('rgba(108,71,255,0.25)')}>🎓</div>
              <div>
                <div style={{ ...S.badgeSubtitle, color: '#7070a0' }}>Always</div>
                100% Free
              </div>
            </div>

            {/* floating badge — bottom-right: Live */}
            <div style={{ ...S.badge, bottom: 150, right: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#ff3e3e', display: 'inline-block', flexShrink: 0,
              }} />
              Live Workshop Now
            </div>

            {/* glass platform base layers */}
            <div style={S.platformInner} />
            <div style={S.platformOuter} />

            {/* ✅ YOUR TRANSPARENT PNG
                Place the file at:
                /var/www/pragni/frontend/public/images/hero-people.png
                It is served as: /images/hero-people.png
            */}
            <img
              src="/images/hero-people.png"
              alt="Learners collaborating"
              style={S.peopleImg}
            />
          </div>

        </div>{/* /heroInner */}
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES  (unchanged)
      ══════════════════════════════════════ */}
      <section className="section-sm" style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--bg2)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:12 }}>
            {Object.entries(CAT_MAP).map(([slug, { label, icon, color }]) => (
              <Link
                key={slug}
                to={`/courses?category=${slug}`}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'18px 12px', borderRadius:14, background:'var(--bg3)', border:'1px solid var(--border)', transition:'all 0.2s', textAlign:'center', fontSize:13, fontWeight:500, color:'var(--text2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.color=color; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=''; e.currentTarget.style.color=''; e.currentTarget.style.transform=''; }}
              >
                <span style={{ fontSize:28 }}>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LIVE WORKSHOPS  (unchanged)
      ══════════════════════════════════════ */}
      {workshops.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Live Sessions</div>
              <h2>Upcoming Workshops &amp; Classes</h2>
              <p>Join live instructor-led sessions. Interactive, hands-on, free.</p>
            </div>
            <div className="grid-2">
              {workshops.slice(0, 4).map(w => (
                <WorkshopBanner key={w._id} workshop={w} onClick={() => { setSelectedWorkshop(w); setJoinResult(null); }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FEATURED COURSES  (unchanged)
      ══════════════════════════════════════ */}
      <section className="section" style={{ background:'var(--bg2)' }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Learn Today</div>
            <h2>Free Courses — Start Instantly</h2>
            <p>No signup required. Just click and start learning.</p>
          </div>
          {courses.length === 0
            ? <div className="empty-state"><div className="icon">📚</div><p>Courses coming soon. Check back weekly!</p></div>
            : <div className="grid-3">{courses.slice(0, 6).map(c => <CourseCard key={c._id} course={c} />)}</div>
          }
          {courses.length > 6 && (
            <div style={{ textAlign:'center', marginTop:40 }}>
              <Link to="/courses" className="btn btn-outline btn-lg">View All Courses →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          MISSION  (unchanged)
      ══════════════════════════════════════ */}
      <section className="section-sm" style={{ background:'var(--accent-bg)', borderTop:'1px solid rgba(108,71,255,0.2)', borderBottom:'1px solid rgba(108,71,255,0.2)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <p className="serif" style={{ fontSize:'clamp(20px,3vw,30px)', color:'var(--accent3)', marginBottom:16 }}>
            "Every learner deserves world-class tech education."
          </p>
          <p style={{ fontSize:15, color:'var(--text2)', maxWidth:560, margin:'0 auto 24px' }}>
            Pragni was founded to break the paywall on cybersecurity and cloud education. Free for everyone, always.
          </p>
          <Link to="/about" className="btn btn-outline">Our Mission →</Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WORKSHOP JOIN MODAL  (unchanged)
      ══════════════════════════════════════ */}
      {selectedWorkshop && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span className="live-badge"><span className="live-dot" />LIVE</span>
                  <span className="tag">
                    {new Date(selectedWorkshop.scheduledAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                  </span>
                </div>
                <h3 style={{ fontSize:20, fontWeight:600 }}>{selectedWorkshop.title}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <p style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>{selectedWorkshop.description}</p>

            {joinResult
              ? (
                <div style={{ padding:16, background:'var(--green-bg)', borderRadius:12, border:'1px solid rgba(0,153,112,0.25)' }}>
                  <p style={{ fontSize:13, color:'var(--green)', marginBottom:10, fontWeight:600 }}>✅ Registered! Join via Google Meet:</p>
                  <a href={joinResult} target="_blank" rel="noopener noreferrer" className="btn btn-green" style={{ width:'100%' }}>
                    Open Google Meet →
                  </a>
                </div>
              ) : (
                <form onSubmit={handleJoin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {joinError && (
                    <div className="tag red" style={{ borderRadius:10, padding:'10px 14px', fontSize:13 }}>⚠️ {joinError}</div>
                  )}
                  <div className="input-group">
                    <label className="input-label">Your Name *</label>
                    <input className="input" placeholder="John Doe" required value={joinForm.name}
                      onChange={e => setJoinForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address *</label>
                    <input type="email" className="input" placeholder="you@email.com" required value={joinForm.email}
                      onChange={e => setJoinForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Mobile Number *</label>
                    <input type="tel" className="input" required placeholder="+91 9876543210" value={joinForm.mobile}
                      onChange={e => setJoinForm(f => ({ ...f, mobile: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:4 }} disabled={joinLoading}>
                    {joinLoading ? 'Getting link...' : 'Get Join Link →'}
                  </button>
                </form>
              )
            }
          </div>
        </div>
      )}
    </>
  );
}
