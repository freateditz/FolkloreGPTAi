import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  BookOpen, 
  Globe, 
  Heart, 
  Headphones, 
  Users, 
  Shield, 
  Sparkles,
  PlayCircle,
  Upload,
  Star,
  Languages,
  Volume2,
  ArrowRight,
  Zap,
  Brain,
  MessageCircle
} from 'lucide-react';

/* =====================================================
   NEUMORPHIC STYLE CONSTANTS
   ===================================================== */
const NEU = {
  bg: '#E0E5EC',
  shadowLight: 'rgba(255,255,255,0.6)',
  shadowDark: 'rgba(163,177,198,0.7)',
  text: '#3D4852',
  textMuted: '#6B7280',
  textHeading: '#2D3748',
  accent: '#6C63FF',
  accentLight: '#8B83FF',
  headingFont: "'Plus Jakarta Sans', sans-serif",
  bodyFont: "'DM Sans', sans-serif",
  extruded: '8px 8px 16px rgba(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6)',
  extrudedSm: '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)',
  extrudedLg: '12px 12px 24px rgba(163,177,198,0.7), -12px -12px 24px rgba(255,255,255,0.6)',
  extrudedXl: '20px 20px 40px rgba(163,177,198,0.7), -20px -20px 40px rgba(255,255,255,0.6)',
  inset: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
  insetSm: 'inset 2px 2px 4px rgba(163,177,198,0.7), inset -2px -2px 4px rgba(255,255,255,0.6)',
  insetLg: 'inset 6px 6px 12px rgba(163,177,198,0.7), inset -6px -6px 12px rgba(255,255,255,0.6)',
};

/* =====================================================
   HERO KEYFRAMES INJECTION
   ===================================================== */
const heroKeyframes = `
@keyframes heroFloat1 {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}
@keyframes heroFloat2 {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(-2deg); }
}
@keyframes heroFloat3 {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-18px) rotate(4deg); }
}
@keyframes heroOrbit {
  0% { transform: rotate(0deg) translateX(12px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
}
@keyframes heroPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0.3; }
}
@keyframes heroBlob1 {
  0%, 100% { border-radius: 42% 58% 62% 38% / 46% 52% 48% 54%; transform: translate(0, 0) scale(1); }
  25% { border-radius: 56% 44% 36% 64% / 60% 38% 62% 40%; transform: translate(20px, -15px) scale(1.05); }
  50% { border-radius: 38% 62% 52% 48% / 42% 60% 40% 58%; transform: translate(-10px, 10px) scale(0.97); }
  75% { border-radius: 60% 40% 44% 56% / 54% 46% 54% 46%; transform: translate(15px, 5px) scale(1.03); }
}
@keyframes heroBlob2 {
  0%, 100% { border-radius: 54% 46% 38% 62% / 48% 56% 44% 52%; transform: translate(0, 0) scale(1); }
  33% { border-radius: 40% 60% 56% 44% / 62% 38% 58% 42%; transform: translate(-15px, 20px) scale(1.04); }
  66% { border-radius: 58% 42% 46% 54% / 44% 52% 48% 56%; transform: translate(10px, -10px) scale(0.96); }
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroWaveBar {
  0%, 100% { height: 30%; }
  50% { height: 90%; }
}
`;

/* =====================================================
   LIQUID BACKGROUND COMPONENT
   ===================================================== */
const LiquidBackground = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {/* Blob 1 — large, slow */}
    <div style={{
      position: 'absolute',
      width: '600px', height: '600px',
      background: `radial-gradient(circle at 30% 40%, rgba(108,99,255,0.06), rgba(108,99,255,0.02) 60%, transparent 80%)`,
      animation: 'heroBlob1 20s ease-in-out infinite',
      top: '-10%', left: '-15%',
    }} />
    {/* Blob 2 — medium, opposite */}
    <div style={{
      position: 'absolute',
      width: '500px', height: '500px',
      background: `radial-gradient(circle at 60% 50%, rgba(139,131,255,0.05), rgba(108,99,255,0.015) 60%, transparent 80%)`,
      animation: 'heroBlob2 18s ease-in-out infinite',
      bottom: '-15%', right: '-10%',
    }} />
    {/* Blob 3 — subtle center */}
    <div style={{
      position: 'absolute',
      width: '400px', height: '400px',
      background: `radial-gradient(circle, rgba(108,99,255,0.035), transparent 70%)`,
      animation: 'heroBlob1 25s ease-in-out 5s infinite',
      top: '30%', left: '40%',
    }} />
  </div>
);

/* =====================================================
   FLOATING VISUAL — INTERACTIVE CARD STACK
   ===================================================== */
const FloatingVisual = ({ isVisible }) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseOffset({ x, y });
  }, []);

  const cards = [
    { icon: Globe, title: "50+ Languages", sub: "Preserved worldwide", color: NEU.accent, delay: '0s', anim: 'heroFloat1', dur: '7s' },
    { icon: BookOpen, title: "1,200+ Stories", sub: "From indigenous cultures", color: '#8B83FF', delay: '0.4s', anim: 'heroFloat2', dur: '6s' },
    { icon: Users, title: "25k+ Members", sub: "Global community", color: '#A78BFA', delay: '0.8s', anim: 'heroFloat3', dur: '8s' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
      style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central glowing orb */}
      <div style={{
        position: 'absolute',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: NEU.bg,
        boxShadow: `${NEU.extrudedXl}, inset 0 0 40px rgba(108,99,255,0.08)`,
        animation: 'heroPulse 4s ease-in-out infinite',
        transform: `translate(${mouseOffset.x * -8}px, ${mouseOffset.y * -8}px)`,
        transition: 'transform 0.4s ease-out',
      }}>
        {/* Inner accent ring */}
        <div style={{
          position: 'absolute', inset: '20px',
          borderRadius: '50%',
          background: NEU.bg,
          boxShadow: NEU.insetLg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: 40, height: 40, color: NEU.accent, opacity: 0.6 }} />
        </div>
      </div>

      {/* Audio waveform ring around the orb */}
      <div style={{
        position: 'absolute',
        width: '260px', height: '260px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `translate(${mouseOffset.x * -5}px, ${mouseOffset.y * -5}px)`,
        transition: 'transform 0.5s ease-out',
      }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360;
          const dist = 120;
          return (
            <div key={i} style={{
              position: 'absolute',
              width: '3px',
              background: NEU.accent,
              borderRadius: '999px',
              opacity: 0.15 + (i % 3) * 0.1,
              left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * dist}px - 1.5px)`,
              top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * dist}px - 8px)`,
              height: '16px',
              transform: `rotate(${angle}deg)`,
              animation: `heroWaveBar ${1.5 + (i % 5) * 0.3}s ease-in-out ${i * 0.08}s infinite`,
            }} />
          );
        })}
      </div>

      {/* Floating stat cards */}
      {cards.map((card, i) => {
        const positions = [
          { top: '2%', left: '5%', rotate: -6 },
          { top: '56%', right: '0%', rotate: 4 },
          { bottom: '2%', left: '12%', rotate: -3 },
        ];
        const pos = positions[i];
        const parallax = (i + 1) * 6;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              animation: `${card.anim} ${card.dur} ease-in-out ${card.delay} infinite`,
              opacity: isVisible ? 1 : 0,
              transform: `translate(${mouseOffset.x * parallax}px, ${mouseOffset.y * parallax}px) rotate(${pos.rotate}deg)`,
              transition: 'opacity 0.8s ease-out, transform 0.4s ease-out',
              transitionDelay: `${i * 0.15}s`,
              zIndex: 10 + i,
            }}
          >
            <div style={{
              background: NEU.bg,
              boxShadow: NEU.extrudedLg,
              borderRadius: '24px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              minWidth: '210px',
            }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '16px',
                background: NEU.bg,
                boxShadow: NEU.inset,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <card.icon style={{ width: 22, height: 22, color: card.color }} />
              </div>
              <div>
                <div style={{
                  fontFamily: NEU.headingFont, fontWeight: 700,
                  fontSize: '1rem', color: NEU.textHeading,
                  letterSpacing: '-0.02em', lineHeight: 1.2,
                }}>{card.title}</div>
                <div style={{
                  fontFamily: NEU.bodyFont, fontSize: '0.78rem',
                  color: NEU.textMuted, marginTop: '2px',
                }}>{card.sub}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Small floating accent dots */}
      {[
        { size: 14, top: '18%', right: '25%', delay: '0s' },
        { size: 10, bottom: '25%', right: '35%', delay: '1.5s' },
        { size: 18, top: '42%', left: '2%', delay: '3s' },
      ].map((dot, i) => (
        <div key={`dot-${i}`} style={{
          position: 'absolute',
          width: dot.size, height: dot.size,
          borderRadius: '50%',
          background: NEU.bg,
          boxShadow: NEU.extrudedSm,
          ...dot,
          animation: `heroOrbit ${6 + i * 2}s linear ${dot.delay} infinite`,
          opacity: 0.5,
        }} />
      ))}
    </div>
  );
};

/* =====================================================
   SCROLL ANIMATION HOOK
   ===================================================== */
const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);

  return [ref, isVisible];
};

/* =====================================================
   NEUMORPHIC ICON WELL COMPONENT
   ===================================================== */
const NeuIconWell = ({ icon: Icon, size = 56, iconSize = 24, accent = false, className = '' }) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      backgroundColor: NEU.bg,
      boxShadow: NEU.inset,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Icon style={{ width: iconSize, height: iconSize, color: accent ? NEU.accent : NEU.text }} />
  </div>
);

/* =====================================================
   NEUMORPHIC BUTTON COMPONENT
   ===================================================== */
const NeuButton = ({ children, to, accent = false, large = false, icon: Icon, style: extraStyle = {} }) => {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    backgroundColor: accent ? NEU.accent : NEU.bg,
    color: accent ? '#ffffff' : NEU.text,
    boxShadow: pressed
      ? (accent ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)` : NEU.insetSm)
      : hovered
        ? (accent ? `6px 6px 12px rgba(108,99,255,0.4), -6px -6px 12px ${NEU.shadowLight}` : `6px 6px 12px ${NEU.shadowDark}, -6px -6px 12px ${NEU.shadowLight}`)
        : (accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px ${NEU.shadowLight}` : NEU.extrudedSm),
    borderRadius: '16px',
    border: 'none',
    padding: large ? '16px 40px' : '14px 32px',
    fontFamily: NEU.headingFont,
    fontWeight: 600,
    fontSize: large ? '1.05rem' : '0.95rem',
    cursor: 'pointer',
    transition: 'all 300ms ease-out',
    transform: hovered && !pressed ? 'translateY(-3px)' : 'translateY(0)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
    ...extraStyle,
  };

  const content = (
    <>
      {Icon && <Icon style={{ width: large ? 22 : 18, height: large ? 22 : 18 }} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {content}
    </button>
  );
};

/* =====================================================
   NEUMORPHIC CARD COMPONENT
   ===================================================== */
const NeuCard = ({ children, className = '', delay = 0, hover = true, style: extraStyle = {} }) => {
  const [ref, isVisible] = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundColor: NEU.bg,
        boxShadow: hovered && hover
          ? `14px 14px 28px ${NEU.shadowDark}, -14px -14px 28px ${NEU.shadowLight}`
          : NEU.extrudedLg,
        borderRadius: '32px',
        padding: '32px',
        transition: 'all 300ms ease-out',
        transform: isVisible
          ? (hovered && hover ? 'translateY(-4px)' : 'translateY(0)')
          : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        ...extraStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
};

/* =====================================================
   MAIN HOME COMPONENT
   ===================================================== */
const Home = () => {
  const [heroRef, heroVisible] = useScrollReveal(0.05);

  const features = [
    {
      icon: Mic,
      title: "Voice Interaction",
      description: "Simply ask for a story and listen to folklore in native languages with our AI voice assistant.",
    },
    {
      icon: Globe,
      title: "Cultural Preservation",
      description: "Helping preserve endangered languages and oral traditions from communities worldwide.",
    },
    {
      icon: BookOpen,
      title: "Story Library",
      description: "Explore thousands of stories from cultures around the world, curated and authenticated.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Stories shared by indigenous communities, cultural keepers, and storytelling elders.",
    }
  ];

  const recentStories = [
    { title: "The Moon's Daughter", culture: "Khasi", region: "Northeast India", duration: "8 min", listeners: "2.3k", rating: 4.9 },
    { title: "The Talking Tree", culture: "Maori", region: "New Zealand", duration: "12 min", listeners: "1.8k", rating: 4.7 },
    { title: "River Spirit's Gift", culture: "Cherokee", region: "North America", duration: "15 min", listeners: "3.1k", rating: 4.8 },
  ];

  const capabilities = [
    { icon: Brain, title: "AI-Powered Translation", description: "Real-time translation of folklore into dozens of languages while preserving cultural nuance." },
    { icon: Zap, title: "Instant Story Generation", description: "Generate new stories inspired by cultural traditions using our advanced AI storytelling engine." },
    { icon: MessageCircle, title: "Voice-First Experience", description: "Interact naturally through voice. Ask for stories, explore cultures, and listen in real time." },
  ];

  return (
    <div style={{ backgroundColor: NEU.bg, minHeight: '100vh', overflow: 'hidden' }}>
      {/* Inject hero keyframes */}
      <style>{heroKeyframes}</style>

      {/* =====================================================
          HERO SECTION — 2-COLUMN LAYOUT
          ===================================================== */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '120px 16px 80px',
        }}
      >
        <LiquidBackground />

        <div
          className="container mx-auto"
          style={{
            maxWidth: '1280px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* ———— LEFT: TEXT CONTENT ———— */}
          <div>
            {/* Badge */}
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 700ms cubic-bezier(0.16,1,0.3,1)',
                marginBottom: '28px',
              }}
            >
              <div style={{
                backgroundColor: NEU.bg,
                boxShadow: NEU.extrudedSm,
                borderRadius: '999px',
                padding: '8px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: NEU.bodyFont,
                fontSize: '0.85rem',
                fontWeight: 600,
                color: NEU.accent,
              }}>
                <Heart style={{ width: 14, height: 14, color: NEU.accent }} />
                Preserving Cultural Heritage
              </div>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: NEU.headingFont,
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
                color: NEU.textHeading,
                letterSpacing: '-0.045em',
                lineHeight: 1.08,
                margin: '0 0 24px 0',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: 'all 800ms cubic-bezier(0.16,1,0.3,1) 150ms',
              }}
            >
              Stories that<br />
              shape <span style={{ color: NEU.accent }}>cultures</span>,<br />
              preserved by <span style={{
                background: `linear-gradient(135deg, ${NEU.accent}, ${NEU.accentLight})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AI</span>.
            </h1>

            {/* Description */}
            <p
              style={{
                fontFamily: NEU.bodyFont,
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: NEU.textMuted,
                maxWidth: '480px',
                lineHeight: 1.75,
                fontWeight: 400,
                margin: '0 0 40px 0',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
                transition: 'all 800ms cubic-bezier(0.16,1,0.3,1) 350ms',
              }}
            >
              FolkloreGPT is an AI-powered voice assistant that brings indigenous folklore and myths
              to life in native dialects — preserving endangered languages for future generations.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '56px',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 800ms cubic-bezier(0.16,1,0.3,1) 550ms',
              }}
            >
              <NeuButton to="/listen" accent large icon={Headphones}>
                Start Listening
              </NeuButton>
              <NeuButton to="/stories" large icon={BookOpen}>
                Browse Stories
              </NeuButton>
            </div>

            {/* Trust Line — small social proof */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 800ms cubic-bezier(0.16,1,0.3,1) 750ms',
              }}
            >
              {/* Mini avatar stack */}
              <div style={{ display: 'flex' }}>
                {['🇮🇳', '🇳🇿', '🇿🇦', '🏔️'].map((flag, i) => (
                  <div key={i} style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: NEU.bg,
                    boxShadow: NEU.extrudedSm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px',
                    marginLeft: i > 0 ? '-8px' : '0',
                    zIndex: 4 - i,
                    border: `2px solid ${NEU.bg}`,
                  }}>{flag}</div>
                ))}
              </div>
              <div>
                <div style={{
                  fontFamily: NEU.headingFont,
                  fontWeight: 700, fontSize: '0.9rem',
                  color: NEU.textHeading,
                }}>25,000+ Community Members</div>
                <div style={{
                  fontFamily: NEU.bodyFont,
                  fontSize: '0.78rem',
                  color: NEU.textMuted,
                }}>From 50+ indigenous cultures worldwide</div>
              </div>
            </div>
          </div>

          {/* ———— RIGHT: INTERACTIVE VISUAL ———— */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 1s ease-out 0.4s',
            }}
          >
            <FloatingVisual isVisible={heroVisible} />
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES SECTION
          ===================================================== */}
      <section style={{ padding: '80px 16px', position: 'relative' }}>
        <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
          <SectionHeader
            title="Preserving Stories Through Technology"
            subtitle="Experience the magic of indigenous folklore with our AI-powered voice assistant"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <NeuCard key={index} delay={index * 150}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <NeuIconWell icon={feature.icon} size={72} iconSize={30} accent />
                  </div>
                  <h3 style={{ fontFamily: NEU.headingFont, fontWeight: 700, fontSize: '1.15rem', color: NEU.textHeading, marginBottom: '12px', letterSpacing: '-0.02em' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontFamily: NEU.bodyFont, fontSize: '0.9rem', color: NEU.textMuted, lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          AI CAPABILITIES SECTION
          ===================================================== */}
      <section style={{ padding: '80px 16px', position: 'relative' }}>
        <div className="container mx-auto" style={{ maxWidth: '1000px' }}>
          <SectionHeader
            title="Powered by Advanced AI"
            subtitle="Our technology enhances storytelling while respecting and preserving cultural authenticity"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {capabilities.map((cap, index) => (
              <NeuCard key={index} delay={index * 200}>
                <div>
                  <div style={{ width: '56px', height: '56px', backgroundColor: NEU.bg, boxShadow: NEU.inset, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <cap.icon style={{ width: 24, height: 24, color: NEU.accent }} />
                  </div>
                  <h3 style={{ fontFamily: NEU.headingFont, fontWeight: 700, fontSize: '1.1rem', color: NEU.textHeading, marginBottom: '10px', letterSpacing: '-0.02em' }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontFamily: NEU.bodyFont, fontSize: '0.88rem', color: NEU.textMuted, lineHeight: 1.7, margin: 0 }}>
                    {cap.description}
                  </p>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          RECENT STORIES SECTION
          ===================================================== */}
      <section style={{ padding: '80px 16px', position: 'relative' }}>
        <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
          <SectionHeader
            title="Recently Shared Stories"
            subtitle="Discover the latest additions to our growing collection"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentStories.map((story, index) => (
              <NeuCard key={index} delay={index * 200}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: NEU.bg, boxShadow: NEU.extrudedSm, borderRadius: '999px', padding: '5px 14px', fontFamily: NEU.bodyFont, fontSize: '0.75rem', fontWeight: 600, color: NEU.accent }}>
                      {story.culture}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', backgroundColor: NEU.bg, boxShadow: NEU.insetSm, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlayCircle style={{ width: 16, height: 16, color: NEU.accent }} />
                      </div>
                      <div style={{ width: '32px', height: '32px', backgroundColor: NEU.bg, boxShadow: NEU.insetSm, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Volume2 style={{ width: 14, height: 14, color: NEU.textMuted }} />
                      </div>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: NEU.headingFont, fontWeight: 700, fontSize: '1.2rem', color: NEU.textHeading, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                    {story.title}
                  </h3>
                  <p style={{ fontFamily: NEU.bodyFont, fontSize: '0.85rem', color: NEU.textMuted, marginBottom: '16px' }}>
                    {story.region}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: NEU.bodyFont, fontSize: '0.8rem', color: NEU.textMuted, marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: 14, height: 14, color: '#F59E0B', fill: '#F59E0B' }} />
                      {story.rating}
                    </span>
                    <span>{story.duration}</span>
                    <span>{story.listeners} listeners</span>
                  </div>
                  <div style={{ backgroundColor: NEU.bg, boxShadow: NEU.insetSm, borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${40 + index * 20}%`, backgroundColor: NEU.accent, borderRadius: '999px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <NeuButton to="/stories" icon={Sparkles}>
              View All Stories
              <ArrowRight style={{ width: 16, height: 16 }} />
            </NeuButton>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA SECTION
          ===================================================== */}
      <section style={{ padding: '80px 16px', position: 'relative' }}>
        <div className="container mx-auto" style={{ maxWidth: '800px' }}>
          <NeuCard hover={false} style={{ padding: '56px 40px', textAlign: 'center', borderRadius: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: NEU.bg, boxShadow: NEU.insetLg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'heroFloat2 4s ease-in-out infinite' }}>
                <Sparkles style={{ width: 32, height: 32, color: NEU.accent }} />
              </div>
            </div>
            <h2 style={{ fontFamily: NEU.headingFont, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: NEU.textHeading, letterSpacing: '-0.04em', marginBottom: '16px', lineHeight: 1.15 }}>
              Share Your Cultural Heritage
            </h2>
            <p style={{ fontFamily: NEU.bodyFont, fontSize: '1.05rem', color: NEU.textMuted, maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              Help preserve your community's stories and languages for future generations.
              Your voice matters.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              <NeuButton to="/submit" accent large icon={Upload}>
                Share Your Story
              </NeuButton>
              <NeuButton to="/about" large icon={Shield}>
                Learn More
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      </section>

      <div style={{ height: '40px' }} />

      {/* =====================================================
          RESPONSIVE OVERRIDES
          ===================================================== */}
      <style>{`
        @media (max-width: 968px) {
          section:first-of-type > div > div {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center;
          }
          section:first-of-type h1 {
            text-align: center !important;
          }
          section:first-of-type p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          section:first-of-type > div > div > div:first-child > div:last-child {
            justify-content: center;
          }
          section:first-of-type > div > div > div:first-child > div:nth-child(4) {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

/* =====================================================
   SECTION HEADER SUB-COMPONENT
   ===================================================== */
const SectionHeader = ({ title, subtitle }) => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        marginBottom: '56px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 700ms ease-out',
      }}
    >
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#2D3748', letterSpacing: '-0.04em', marginBottom: '12px', lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', color: '#6B7280', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>
        {subtitle}
      </p>
    </div>
  );
};

export default Home;