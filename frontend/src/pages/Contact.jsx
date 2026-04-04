import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { 
  Mail, Phone, MapPin, Send, Heart, Globe, MessageCircle, Clock,
  Users, Shield, Headphones, BookOpen, Sparkles, Check, AlertCircle,
  Github, Twitter, Linkedin
} from 'lucide-react';
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
    style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px', ...style }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowHover; e.currentTarget.style.transform = 'translateY(-4px)'; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = NEU.shadowExtruded; e.currentTarget.style.transform = 'translateY(0)'; }}}
  >
    {children}
  </div>
);

const NeuInput = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <input
      id={id}
      required={required}
      className="w-full outline-none transition-all duration-300"
      style={{
        background: NEU.bg,
        boxShadow: NEU.shadowInset,
        borderRadius: '16px',
        border: 'none',
        padding: '14px 20px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.95rem',
        color: NEU.text,
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
      {...props}
    />
  </div>
);

const NeuTextarea = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <textarea
      id={id}
      required={required}
      className="w-full outline-none transition-all duration-300 resize-none"
      style={{
        background: NEU.bg,
        boxShadow: NEU.shadowInset,
        borderRadius: '16px',
        border: 'none',
        padding: '14px 20px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.95rem',
        color: NEU.text,
        minHeight: '140px',
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
      {...props}
    />
  </div>
);

const NeuSelect = ({ label, id, required, options, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
      {label} {required && <span style={{ color: NEU.accent }}>*</span>}
    </label>
    <select
      id={id}
      required={required}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full outline-none transition-all duration-300 cursor-pointer appearance-none"
      style={{
        background: NEU.bg,
        boxShadow: NEU.shadowInset,
        borderRadius: '16px',
        border: 'none',
        padding: '14px 20px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.95rem',
        color: value ? NEU.text : NEU.textMuted,
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const NeuButton = ({ children, accent = false, className = '', disabled, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    style={{
      background: accent ? NEU.accent : NEU.bg,
      color: accent ? '#fff' : NEU.text,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm,
      borderRadius: '16px',
      border: 'none',
      padding: '14px 32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.95rem',
      width: '100%',
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-3px)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    onMouseDown={e => { if (!disabled) { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}}
    onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowExtrudedSm; }}}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const NeuIconWell = ({ children, size = 48, accent = false }) => (
  <div
    className="flex items-center justify-center flex-shrink-0"
    style={{
      width: size, height: size,
      background: accent ? NEU.accent : NEU.bg,
      boxShadow: accent ? `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` : NEU.shadowInset,
      borderRadius: '50%',
      color: accent ? '#fff' : NEU.accent,
    }}
  >
    {children}
  </div>
);

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', category: '', message: '', culture: '', consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5001/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, submittedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Message sent successfully!", description: "We'll get back to you within 24 hours." });
        setFormData({ name: '', email: '', subject: '', category: '', message: '', culture: '', consent: false });
      } else { throw new Error(data.error || 'Failed to save'); }
    } catch (error) {
      toast({ title: "Submission failed", description: "There was an error. Please try again.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const contactInfo = [
    { icon: Mail, title: "Email Us", content: "hello@folkloregpt.org", description: "General inquiries and support" },
    { icon: Phone, title: "Call Us", content: "+1 (555) 123-4567", description: "Mon-Fri, 9AM-6PM EST" },
    { icon: MapPin, title: "Visit Us", content: "123 Cultural Heritage Ave, NY", description: "Cultural preservation center" },
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'story-submission', label: 'Story Submission' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'media', label: 'Media & Press' },
    { value: 'research', label: 'Academic Research' },
    { value: 'feedback', label: 'Feedback' },
  ];

  const cultures = ['Khasi', 'Maori', 'Cherokee', 'Inuit', 'Zulu', 'Aboriginal Australian', 'Quechua', 'Navajo', 'Sami', 'Other'];

  const team = [
    { name: "Dr. Sarah Cloudwalker", role: "Director of Cultural Affairs", specialty: "Indigenous storytelling traditions" },
    { name: "Kai Tangaroa", role: "Language Preservation Lead", specialty: "Endangered language documentation" },
    { name: "Dr. Aisha Kone", role: "AI Ethics Director", specialty: "Ethical AI and cultural sensitivity" },
  ];

  const faqs = [
    { question: "How can I submit a story from my community?", answer: "You can submit stories through our Submit page or contact us directly. We work with community elders to ensure proper permission and attribution." },
    { question: "Is FolkloreGPT free to use?", answer: "Yes! FolkloreGPT is completely free. Our mission is cultural preservation, not profit." },
    { question: "How do you ensure cultural accuracy?", answer: "We work directly with indigenous communities and cultural experts to verify all content before publication." },
    { question: "Can I use these stories for educational purposes?", answer: "Yes, with proper attribution. Please contact us for specific licensing requirements for educational use." },
  ];

  const responseTimes = [
    { label: "General Inquiries", time: "24 hours" },
    { label: "Technical Support", time: "2-4 hours" },
    { label: "Partnership Requests", time: "2-3 days" },
    { label: "Story Submissions", time: "1-2 weeks" },
  ];

  return (
    <div className="min-h-screen relative py-12 overflow-hidden" style={{ background: NEU.bg }}>
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <NeuIconWell size={80} accent>
            <MessageCircle className="w-10 h-10" />
          </NeuIconWell>
          <h1 className="text-5xl md:text-6xl font-bold mt-8 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
            Get In Touch
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: NEU.textMuted }}>
            Connect with our team to learn more about cultural preservation, share your stories, or explore partnership opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <NeuCard className="p-8" hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <Send className="w-6 h-6" style={{ color: NEU.accent }} />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                Send us a Message
              </h2>
            </div>
            <p className="mb-8" style={{ color: NEU.textMuted }}>We'd love to hear from you.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NeuInput label="Full Name" id="name" required value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Your full name" />
                <NeuInput label="Email Address" id="email" type="email" required value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="your.email@example.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NeuSelect label="Inquiry Type" id="category" required options={categories} value={formData.category} onChange={v => handleInputChange('category', v)} placeholder="Select a category" />
                <NeuSelect label="Cultural Background" id="culture" options={cultures.map(c => ({ value: c, label: c }))} value={formData.culture} onChange={v => handleInputChange('culture', v)} placeholder="Select your culture" />
              </div>
              <NeuInput label="Subject" id="subject" required value={formData.subject} onChange={e => handleInputChange('subject', e.target.value)} placeholder="Brief subject of your message" />
              <NeuTextarea label="Message" id="message" required value={formData.message} onChange={e => handleInputChange('message', e.target.value)} placeholder="Tell us more about your inquiry..." />

              <div className="flex items-start space-x-3"
                style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px', padding: '14px 20px' }}>
                <input type="checkbox" id="consent" checked={formData.consent} onChange={e => handleInputChange('consent', e.target.checked)} className="mt-1" style={{ accentColor: NEU.accent }} required />
                <label htmlFor="consent" className="text-sm leading-relaxed" style={{ color: NEU.textMuted }}>
                  I consent to FolkloreGPT storing my information and contacting me regarding my inquiry.
                </label>
              </div>

              <NeuButton type="submit" accent disabled={isSubmitting}>
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> Send Message</>
                )}
              </NeuButton>
            </form>
          </NeuCard>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
                <Globe className="w-6 h-6" style={{ color: NEU.accent }} />
                Contact Information
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <NeuCard key={index} className="p-5">
                    <div className="flex items-start gap-4">
                      <NeuIconWell size={48} accent>
                        <info.icon className="w-5 h-5" />
                      </NeuIconWell>
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: NEU.textHeading }}>{info.title}</h4>
                        <p className="font-medium mb-1" style={{ color: NEU.text }}>{info.content}</p>
                        <p className="text-sm" style={{ color: NEU.textMuted }}>{info.description}</p>
                      </div>
                    </div>
                  </NeuCard>
                ))}
              </div>
            </div>

            {/* Response Times */}
            <NeuCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" style={{ color: NEU.accent }} />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Response Times</h3>
              </div>
              <div className="space-y-3">
                {responseTimes.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span style={{ color: NEU.textMuted }}>{item.label}</span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, color: NEU.accent, borderRadius: '999px' }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Social Links */}
            <NeuCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" style={{ color: NEU.accent }} />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Follow Our Journey</h3>
              </div>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, label: "Twitter" },
                  { icon: Github, label: "GitHub" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map((social, i) => (
                  <button key={i} className="transition-all duration-300"
                    style={{ width: 48, height: 48, background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: NEU.accent }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = NEU.shadowHover; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; }}
                    onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; e.currentTarget.style.transform = 'translateY(0)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = NEU.shadowHover; }}
                  >
                    <social.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>Meet Our Team</h2>
            <p style={{ color: NEU.textMuted, fontSize: '1.125rem' }}>Dedicated experts in cultural preservation and AI ethics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <NeuCard key={index} className="text-center p-6">
                <NeuIconWell size={64} accent>
                  <Users className="w-8 h-8" />
                </NeuIconWell>
                <h3 className="text-lg font-bold mt-4 mb-1" style={{ color: NEU.textHeading }}>{member.name}</h3>
                <p className="text-sm mb-2" style={{ color: NEU.accent }}>{member.role}</p>
                <p className="text-xs mb-4" style={{ color: NEU.textMuted }}>{member.specialty}</p>
                <NeuButton>
                  <Mail className="w-3 h-3" /> Contact
                </NeuButton>
              </NeuCard>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <NeuCard key={index} className="p-6">
                <h4 className="font-semibold mb-3 flex items-start gap-2" style={{ color: NEU.textHeading }}>
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: NEU.accent }} />
                  {faq.question}
                </h4>
                <p className="leading-relaxed" style={{ color: NEU.textMuted }}>{faq.answer}</p>
              </NeuCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
