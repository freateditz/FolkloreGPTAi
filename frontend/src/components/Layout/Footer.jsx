import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const linkStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    color: '#6B7280',
    textDecoration: 'none',
    transition: 'all 300ms ease-out',
    display: 'block',
    padding: '4px 0',
  };

  const socialBtnStyle = {
    width: '44px',
    height: '44px',
    backgroundColor: '#E0E5EC',
    boxShadow: '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 300ms ease-out',
    cursor: 'pointer',
    color: '#6B7280',
    textDecoration: 'none',
  };

  return (
    <footer style={{ backgroundColor: '#E0E5EC', paddingTop: '48px' }}>
      {/* Top divider */}
      <div
        style={{
          height: '2px',
          backgroundColor: '#E0E5EC',
          boxShadow: '0 1px 3px rgba(163,177,198,0.7), 0 -1px 3px rgba(255,255,255,0.6)',
          margin: '0 auto',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Mission */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#E0E5EC',
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Globe className="w-5 h-5" style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: '#2D3748',
                    letterSpacing: '-0.03em',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  FolkloreGPT
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Preserving Stories, Protecting Languages
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                color: '#6B7280',
                lineHeight: 1.7,
                maxWidth: '420px',
                marginBottom: '16px',
              }}
            >
              Dedicated to preserving indigenous folklore and endangered languages through AI-powered storytelling.
              Every story shared helps keep cultural heritage alive for future generations.
            </p>
            <div className="flex items-center" style={{ gap: '8px', color: '#6B7280' }}>
              <Heart className="w-4 h-4" style={{ color: '#6C63FF' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500 }}>
                Made with respect for all cultures
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#2D3748',
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Explore
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Browse Stories', to: '/stories' },
                { label: 'Voice Interface', to: '/listen' },
                { label: 'Share a Story', to: '/submit' },
                { label: 'Our Mission', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    style={linkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#6C63FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#2D3748',
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Community
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Cultural Partners',
                'Language Preservation',
                'Educational Resources',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={linkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#6C63FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  style={linkStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#6C63FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Neumorphic divider */}
          <div
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: '#E0E5EC',
              boxShadow: '0 1px 2px rgba(163,177,198,0.7), 0 -1px 2px rgba(255,255,255,0.6)',
              marginBottom: '24px',
            }}
          />

          <div className="flex items-center" style={{ gap: '12px' }}>
            {[
              { Icon: Github, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Mail, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                style={socialBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '6px 6px 12px rgba(163,177,198,0.7), -6px -6px 12px rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.color = '#6C63FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
              © 2025 FolkloreGPT. Cultural preservation through technology.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#9CA3AF', margin: '4px 0 0 0' }}>
              Built with respect for indigenous communities worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;