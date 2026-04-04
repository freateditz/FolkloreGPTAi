import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Globe, Users, Shield, BookOpen, Mic, Languages, TreePine, Star,
  Target, Lightbulb, Award, Handshake, ChevronRight, PlayCircle, Upload,
  Headphones, Sparkles, Zap, Eye, CheckCircle2, Rocket, Compass
} from 'lucide-react';
import { mockStats } from '../utils/mockData';
import AnimatedBackground from '../components/AnimatedBackground';

// Neumorphic design tokens
const NEU = {
  bg: '#E0E5EC',
  text: '#3D4852',
  textMuted: '#6B7280',
  textHeading: '#2D3748',
  accent: '#6C63FF',
  accentLight: '#8B83FF',
  shadowExtruded: '8px 8px 16px rgba(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6)',
  shadowExtrudedSm: '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)',
  shadowExtrudedLg: '12px 12px 24px rgba(163,177,198,0.7), -12px -12px 24px rgba(255,255,255,0.6)',
  shadowInset: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
  shadowInsetSm: 'inset 2px 2px 4px rgba(163,177,198,0.7), inset -2px -2px 4px rgba(255,255,255,0.6)',
  shadowHover: '10px 10px 20px rgba(163,177,198,0.7), -10px -10px 20px rgba(255,255,255,0.6)',
};

const NeuCard = ({ children, className = '', hover = true, style = {} }) => (
  <div
    className={`transition-all duration-300 ${className}`}
    style={{
      background: NEU.bg,
      boxShadow: NEU.shadowExtruded,
      borderRadius: '24px',
      ...(hover ? {} : {}),
      ...style,
    }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-4px)'; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowExtruded; e.currentTarget.style.transform = 'translateY(0)'; }}}
  >
    {children}
  </div>
);

const NeuIconWell = ({ children, size = 64, accent = false }) => (
  <div
    className="flex items-center justify-center flex-shrink-0"
    style={{
      width: size, height: size,
      background: accent ? NEU.accent : NEU.bg,
      boxShadow: accent
        ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`
        : NEU.shadowInset,
      borderRadius: '50%',
      color: accent ? '#fff' : NEU.accent,
    }}
  >
    {children}
  </div>
);

const NeuButton = ({ children, accent = false, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.text,
      boxShadow: accent
        ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`
        : NEU.shadowExtrudedSm,
      borderRadius: '16px',
      border: 'none',
      padding: '14px 32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.95rem',
      letterSpacing: '-0.01em',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = accent
        ? `6px 6px 12px rgba(108,99,255,0.4), -6px -6px 12px rgba(255,255,255,0.6)`
        : '6px 6px 12px rgba(163,177,198,0.7), -6px -6px 12px rgba(255,255,255,0.6)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = accent
        ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`
        : NEU.shadowExtrudedSm;
    }}
    onMouseDown={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = accent
        ? `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)`
        : NEU.shadowInsetSm;
    }}
    onMouseUp={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = accent
        ? `6px 6px 12px rgba(108,99,255,0.4), -6px -6px 12px rgba(255,255,255,0.6)`
        : '6px 6px 12px rgba(163,177,198,0.7), -6px -6px 12px rgba(255,255,255,0.6)';
    }}
    {...props}
  >
    {children}
  </button>
);

const About = () => {
  const teamMembers = [
    { name: "Dr. Sarah Cloudwalker", role: "Cultural Anthropologist", bio: "Cherokee scholar specializing in oral traditions and digital preservation", icon: "🌺" },
    { name: "Kai Tangaroa", role: "Maori Language Expert", bio: "Native speaker working on Te Reo Maori revitalization through technology", icon: "🌿" },
    { name: "Dr. Aisha Kone", role: "AI Ethics Specialist", bio: "Ensuring respectful and ethical use of indigenous knowledge in AI systems", icon: "🔬" },
  ];

  const features = [
    { icon: Mic, title: "Voice-First Design", description: "Natural conversation in native languages with AI-powered understanding" },
    { icon: Languages, title: "Multilingual Support", description: "Preserving stories in original languages with optional translations" },
    { icon: Shield, title: "Cultural Respect", description: "Community-approved content with proper attribution and context" },
    { icon: Globe, title: "Global Reach", description: "Making indigenous stories accessible worldwide while respecting origins" },
  ];

  const impacts = [
    { icon: BookOpen, title: "Stories Preserved", value: mockStats.totalStories, description: "Traditional stories now digitally preserved" },
    { icon: Languages, title: "Languages Supported", value: mockStats.totalLanguages, description: "Indigenous languages with active content" },
    { icon: Users, title: "Community Members", value: mockStats.totalListeners, description: "People engaged with cultural preservation" },
    { icon: TreePine, title: "Cultural Groups", value: mockStats.totalCultures, description: "Indigenous communities represented" },
  ];

  const principles = [
    { icon: Heart, title: "Respect & Honor", description: "Every story is treated with the dignity it deserves, acknowledging its cultural significance and the wisdom of its origin community." },
    { icon: Handshake, title: "Community Partnership", description: "We work directly with indigenous communities, ensuring they maintain control over their cultural narratives and receive proper recognition." },
    { icon: Shield, title: "Cultural Protection", description: "Sacred or sensitive stories are handled with special care, respecting traditional protocols and community guidelines." },
    { icon: Target, title: "Educational Purpose", description: "Our mission is to educate and preserve, not to commercialize or exploit indigenous knowledge and traditions." },
  ];

  const milestones = [
    { year: "2023", event: "FolkloreGPT concept born", description: "Initial idea to preserve indigenous stories through AI" },
    { year: "2024", event: "First partnerships formed", description: "Collaboration with 5 indigenous communities" },
    { year: "2024", event: "Voice AI integration", description: "Advanced multilingual voice recognition and synthesis" },
    { year: "2025", event: "Global expansion", description: "50+ languages and 1000+ stories preserved" },
  ];

  const progressItems = [
    { label: "Cultural Sensitivity", value: 98 },
    { label: "Community Trust", value: 95 },
    { label: "Language Accuracy", value: 92 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: NEU.bg }}>
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto text-center relative z-10">
          <NeuIconWell size={96} accent>
            <Heart className="w-12 h-12 text-white" />
          </NeuIconWell>
          <div className="mt-8" />

          <h1
            className="text-6xl md:text-7xl font-bold mb-8 animate-fadeInUp"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}
          >
            Our Mission
          </h1>

          <p
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed animate-fadeInUp"
            style={{ color: NEU.textMuted, animationDelay: '200ms' }}
          >
            Preserving indigenous folklore and endangered languages through AI-powered storytelling, ensuring cultural heritage survives for future generations.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link to="/listen">
              <NeuButton accent>
                <PlayCircle className="w-5 h-5" />
                Experience Stories
              </NeuButton>
            </Link>
            <Link to="/submit">
              <NeuButton>
                <Upload className="w-5 h-5" />
                Share Your Story
              </NeuButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Our Impact
            </h2>
            <p style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>Together, we're making a difference in cultural preservation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impacts.map((impact, index) => {
              const Icon = impact.icon;
              return (
                <NeuCard key={index} className="text-center p-8">
                  <NeuIconWell size={80} accent>
                    <Icon className="w-10 h-10" />
                  </NeuIconWell>
                  <div className="mt-6">
                    <div className="text-4xl font-bold mb-3" style={{ color: NEU.accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {impact.value.toLocaleString()}+
                    </div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: NEU.textHeading }}>{impact.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: NEU.textMuted }}>{impact.description}</p>
                  </div>
                </NeuCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Our Core Principles
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>
              These values guide everything we do in our mission to preserve and share indigenous stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <NeuCard key={index} className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <NeuIconWell size={64} accent>
                      <Icon className="w-8 h-8" />
                    </NeuIconWell>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                      {principle.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed text-lg" style={{ color: NEU.textMuted }}>{principle.description}</p>
                </NeuCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              How It Works
            </h2>
            <p style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>Advanced technology meets traditional wisdom</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <NeuCard key={index} className="text-center p-8">
                  <NeuIconWell size={80} accent>
                    <Icon className="w-10 h-10" />
                  </NeuIconWell>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: NEU.textMuted }}>{feature.description}</p>
                  </div>
                </NeuCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ethical AI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                Ethical AI for Cultural Preservation
              </h2>
              <div className="space-y-6 text-lg leading-relaxed" style={{ color: NEU.textMuted }}>
                <p>Our AI technology is designed with indigenous communities at the center, ensuring that every story is treated with the respect and cultural sensitivity it deserves.</p>
                <p>We use advanced natural language processing to understand context, cultural nuances, and the deeper meanings within traditional stories, while always maintaining community control over their cultural narratives.</p>
              </div>

              <div className="mt-8 space-y-4">
                {["Community-approved content only", "Proper attribution and context", "Secure, respectful data handling", "Educational, non-commercial use"].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div style={{ width: 28, height: 28, background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: NEU.accent }} />
                    </div>
                    <span className="font-medium" style={{ color: NEU.textHeading }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <NeuCard className="p-8">
              <div className="text-center mb-8">
                <NeuIconWell size={80} accent>
                  <Lightbulb className="w-10 h-10" />
                </NeuIconWell>
                <h3 className="text-2xl font-bold mt-6 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                  Innovation with Integrity
                </h3>
                <p style={{ color: NEU.textMuted }}>Balancing cutting-edge technology with traditional values</p>
              </div>

              <div className="space-y-6">
                {progressItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: NEU.textHeading }}>{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: NEU.accent }}>{item.value}%</span>
                    </div>
                    <div style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: NEU.accent, borderRadius: '999px', transition: 'width 1s ease-out' }} />
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Our Journey
            </h2>
            <p style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>Milestones in cultural preservation</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '4px' }} />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <NeuCard className={`w-full max-w-sm p-6 ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ background: NEU.accent, borderRadius: '50%', boxShadow: `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` }}
                      >
                        {milestone.year.slice(-2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg" style={{ color: NEU.textHeading }}>{milestone.event}</h4>
                        <p className="text-sm" style={{ color: NEU.textMuted }}>{milestone.year}</p>
                      </div>
                    </div>
                    <p style={{ color: NEU.textMuted }}>{milestone.description}</p>
                  </NeuCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Meet Our Team
            </h2>
            <p style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>Dedicated experts in cultural preservation and AI ethics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <NeuCard key={index} className="text-center p-8">
                <div
                  className="w-24 h-24 flex items-center justify-center mx-auto mb-6 text-3xl"
                  style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '50%' }}
                >
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: NEU.textHeading }}>{member.name}</h3>
                <span
                  className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                  style={{ background: NEU.accent, color: '#fff', boxShadow: `3px 3px 6px rgba(108,99,255,0.3), -3px -3px 6px rgba(255,255,255,0.6)` }}
                >
                  {member.role}
                </span>
                <p className="text-sm leading-relaxed mb-6" style={{ color: NEU.textMuted }}>{member.bio}</p>
                <NeuButton>
                  <Eye className="w-4 h-4" />
                  Learn More
                </NeuButton>
              </NeuCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <NeuCard className="p-12 text-center" hover={false} style={{ boxShadow: NEU.shadowExtrudedLg }}>
            <NeuIconWell size={80} accent>
              <Award className="w-10 h-10" />
            </NeuIconWell>
            <h2 className="text-4xl md:text-5xl font-bold mt-8 mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Join Our Mission
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: NEU.textMuted }}>
              Help us preserve cultural heritage for future generations. Every story matters, every voice counts, and every culture deserves to be remembered.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: Headphones, title: "Listen & Learn", desc: "Explore stories from cultures around the world" },
                { icon: Upload, title: "Share Stories", desc: "Contribute your community's oral traditions" },
                { icon: Heart, title: "Support Us", desc: "Help fund cultural preservation efforts" },
              ].map((item, index) => (
                <div key={index} className="p-6" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '20px' }}>
                  <NeuIconWell size={56} accent>
                    <item.icon className="w-7 h-7" />
                  </NeuIconWell>
                  <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: NEU.textHeading }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: NEU.textMuted }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/submit">
                <NeuButton accent>
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </NeuButton>
              </Link>
              <Link to="/stories">
                <NeuButton>
                  <BookOpen className="w-5 h-5" />
                  Explore Stories
                </NeuButton>
              </Link>
            </div>
          </NeuCard>
        </div>
      </section>
    </div>
  );
};

export default About;