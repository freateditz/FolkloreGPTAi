import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  BookOpen, 
  Settings, 
  Heart, 
  Globe, 
  Menu, 
  X,
  Headphones,
  Sparkles
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: BookOpen },
    { name: 'Stories', href: '/stories', icon: BookOpen },
    { name: 'Listen', href: '/listen', icon: Headphones },
    { name: 'Share Story', href: '/submit', icon: Mic },
    { name: 'About', href: '/about', icon: Heart },
    { name: 'Contact', href: '/contact', icon: Settings },
    { name: 'AI Storyteller', href: '/ai-storyteller', icon: Sparkles, badge: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: '#E0E5EC',
        transition: 'all 300ms ease-out',
        boxShadow: scrolled
          ? '0 4px 12px rgba(163,177,198,0.4), 0 -2px 8px rgba(255,255,255,0.3)'
          : 'none',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{
                backgroundColor: '#E0E5EC',
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
                borderRadius: '50%',
                transition: 'all 300ms ease-out',
              }}
            >
              <Globe className="w-6 h-6" style={{ color: '#6C63FF' }} />
            </div>
            <div className="hidden sm:block">
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#2D3748',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                FolkloreGPT
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.7rem',
                  color: '#6B7280',
                  marginTop: '-2px',
                  fontWeight: 500,
                }}
              >
                Preserving Stories
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group relative flex items-center space-x-2 px-4 py-2.5 text-sm font-medium"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: isActive(item.href) ? '#6C63FF' : '#3D4852',
                    backgroundColor: '#E0E5EC',
                    boxShadow: isActive(item.href)
                      ? 'inset 3px 3px 6px rgba(163,177,198,0.7), inset -3px -3px 6px rgba(255,255,255,0.6)'
                      : 'none',
                    borderRadius: '12px',
                    transition: 'all 300ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.boxShadow = '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" style={{ transition: 'transform 300ms ease-out' }} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: '#6C63FF',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        marginLeft: '4px',
                      }}
                    >
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Cultural Badge */}
            <div
              className="hidden sm:flex items-center"
              style={{
                backgroundColor: '#E0E5EC',
                boxShadow: '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: '#6B7280',
                gap: '6px',
              }}
            >
              <Heart className="w-3 h-3" style={{ color: '#6C63FF' }} />
              Cultural Preservation
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className="hidden sm:flex items-center"
              style={{
                backgroundColor: '#E0E5EC',
                boxShadow: '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: '#3D4852',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 300ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '5px 5px 10px rgba(163,177,198,0.7), -5px -5px 10px rgba(255,255,255,0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                backgroundColor: '#E0E5EC',
                boxShadow: isMobileMenuOpen
                  ? 'inset 3px 3px 6px rgba(163,177,198,0.7), inset -3px -3px 6px rgba(255,255,255,0.6)'
                  : '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)',
                borderRadius: '12px',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                transition: 'all 300ms ease-out',
                color: '#3D4852',
              }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden"
            style={{
              animation: 'slideDown 0.3s ease-out',
              paddingBottom: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#E0E5EC',
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
                borderRadius: '24px',
                padding: '12px',
                marginTop: '8px',
              }}
            >
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      color: isActive(item.href) ? '#6C63FF' : '#3D4852',
                      backgroundColor: isActive(item.href) ? '#E0E5EC' : 'transparent',
                      boxShadow: isActive(item.href)
                        ? '3px 3px 6px rgba(163,177,198,0.7), -3px -3px 6px rgba(255,255,255,0.6)'
                        : 'none',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      transition: 'all 300ms ease-out',
                      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#E0E5EC',
                        boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.7), inset -2px -2px 4px rgba(255,255,255,0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        style={{
                          backgroundColor: '#6C63FF',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          marginLeft: 'auto',
                        }}
                      >
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile CTA */}
              <div style={{ padding: '12px 4px 4px 4px', marginTop: '8px' }}>
                <div
                  style={{
                    height: '2px',
                    backgroundColor: '#E0E5EC',
                    boxShadow: '0 1px 2px rgba(163,177,198,0.7), 0 -1px 2px rgba(255,255,255,0.6)',
                    marginBottom: '12px',
                  }}
                />
                <Link
                  to="/submit"
                  className="flex items-center justify-center space-x-2 px-4 py-3"
                  style={{
                    backgroundColor: '#6C63FF',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)',
                    transition: 'all 300ms ease-out',
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Mic className="w-5 h-5" />
                  <span>Share Your Story</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
