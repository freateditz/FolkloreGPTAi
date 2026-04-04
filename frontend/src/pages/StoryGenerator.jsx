import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Copy, AlertCircle, Loader2 } from 'lucide-react';

const NEU = {
  bg: '#E0E5EC',
  text: '#3D4852',
  textMuted: '#6B7280',
  textHeading: '#2D3748',
  accent: '#6C63FF',
  shadowExtruded: '8px 8px 16px rgba(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6)',
  shadowExtrudedSm: '4px 4px 8px rgba(163,177,198,0.7), -4px -4px 8px rgba(255,255,255,0.6)',
  shadowExtrudedLg: '12px 12px 24px rgba(163,177,198,0.7), -12px -12px 24px rgba(255,255,255,0.6)',
  shadowInset: 'inset 4px 4px 8px rgba(163,177,198,0.7), inset -4px -4px 8px rgba(255,255,255,0.6)',
  shadowInsetSm: 'inset 2px 2px 4px rgba(163,177,198,0.7), inset -2px -2px 4px rgba(255,255,255,0.6)',
  shadowHover: '10px 10px 20px rgba(163,177,198,0.7), -10px -10px 20px rgba(255,255,255,0.6)',
};

const StoryGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New State variables
  const [storyLength, setStoryLength] = useState(400);
  const [culture, setCulture] = useState('');
  const [tone, setTone] = useState('traditional');

  const API_URL = 'http://localhost:8000/api/generate';

  const handleGenerate = async (isContinue = false) => {
    let finalPrompt = prompt;
    if (isContinue) {
      finalPrompt = `Continue the following story naturally (do NOT write a title, just add the next paragraphs). Existing story: ${story}`;
      setLoading(true); setError('');
    } else {
      if (!prompt.trim()) { setError('Please enter a prompt first'); return; }
      setLoading(true); setError(''); setStory('');
    }
    
    try {
      const response = await axios.post(API_URL, { 
        prompt: finalPrompt, 
        max_length: parseInt(storyLength),
        culture: culture || undefined,
        tone: tone
      });
      
      const newText = response.data.generated_story || response.data.story;
      
      if (isContinue) {
        setStory(prev => prev + '\n\n' + newText);
      } else {
        setStory(newText);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Could not generate story. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: NEU.bg }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
            style={{ background: NEU.accent, borderRadius: '50%', boxShadow: `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)` }}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
            FolkloreGPT Storyteller
          </h1>
          <p className="text-lg" style={{ color: NEU.textMuted }}>
            Generate unique folklore stories powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="p-8" style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Your Story Prompt
            </h2>

            <div className="mb-6">
              <label className="block font-medium mb-3" style={{ color: NEU.textMuted }}>
                What kind of story would you like?
              </label>
              <textarea
                className="w-full h-40 resize-none outline-none transition-all duration-300"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.shadowInset,
                  borderRadius: '16px',
                  border: 'none',
                  padding: '16px 20px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.95rem',
                  color: NEU.text,
                }}
                placeholder="Example: A story about a clever fox who outwits a tiger in the Himalayan mountains..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.shadowInset}, 0 0 0 3px rgba(108,99,255,0.2)`; }}
                onBlur={e => { e.currentTarget.style.boxShadow = NEU.shadowInset; }}
              />
            </div>

            {/* AI Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                 <label className="block text-sm font-bold mb-2" style={{ color: NEU.textMuted }}>Story Length</label>
                 <select value={storyLength} onChange={e => setStoryLength(e.target.value)}
                         className="w-full p-3 outline-none" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '12px', border: 'none', color: NEU.text }}>
                    <option value={150}>Short (~150 words)</option>
                    <option value={400}>Medium (~400 words)</option>
                    <option value={800}>Long (~800 words)</option>
                    <option value={1500}>Epic (~1500 words)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-bold mb-2" style={{ color: NEU.textMuted }}>Culture Context</label>
                 <select value={culture} onChange={e => setCulture(e.target.value)}
                         className="w-full p-3 outline-none" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '12px', border: 'none', color: NEU.text }}>
                    <option value="">Any / General</option>
                    <option value="African">African</option>
                    <option value="Asian">Asian</option>
                    <option value="European">European</option>
                    <option value="Native American">Native American</option>
                    <option value="Norse">Norse</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-bold mb-2" style={{ color: NEU.textMuted }}>Tone</label>
                 <select value={tone} onChange={e => setTone(e.target.value)}
                         className="w-full p-3 outline-none" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '12px', border: 'none', color: NEU.text }}>
                    <option value="traditional">Traditional</option>
                    <option value="dark">Dark & Mysterious</option>
                    <option value="humorous">Humorous</option>
                    <option value="heroic">Epic & Heroic</option>
                    <option value="child-friendly">Child-Friendly</option>
                 </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="w-full font-bold text-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: loading ? '#b0b8c8' : NEU.accent,
                color: '#fff',
                boxShadow: loading ? NEU.shadowInsetSm : `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`,
                borderRadius: '16px',
                border: 'none',
                padding: '16px 24px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={e => { if (!loading) { e.currentTarget.style.boxShadow = `inset 3px 3px 6px rgba(90,82,224,0.5), inset -3px -3px 6px rgba(139,131,255,0.3)`; e.currentTarget.style.transform = 'translateY(0)'; }}}
              onMouseUp={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `4px 4px 8px rgba(108,99,255,0.3), -4px -4px 8px rgba(255,255,255,0.6)`; }}}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Weaving your tale...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate New Story</>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 flex items-center gap-2" style={{ background: NEU.bg, boxShadow: NEU.shadowInsetSm, borderRadius: '16px', borderLeft: `4px solid #EF4444` }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
                <p className="font-medium" style={{ color: '#EF4444' }}>{error}</p>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="p-8" style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
              Your Generated Story
            </h2>

            {story ? (
              <div>
                <div className="p-6 overflow-y-auto" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', minHeight: '300px', maxHeight: '500px' }}>
                  <p className="leading-relaxed whitespace-pre-line" style={{ color: NEU.text }}>{story}</p>
                </div>
                <div className="mt-6 pt-6 flex flex-wrap gap-4" style={{ borderTop: '1px solid #d1d9e6' }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(story)}
                    className="inline-flex items-center gap-2 font-medium transition-all duration-300 cursor-pointer"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.shadowExtrudedSm,
                      borderRadius: '12px',
                      border: 'none',
                      padding: '10px 20px',
                      color: NEU.accent,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    onMouseDown={e => { e.currentTarget.style.boxShadow = NEU.shadowInsetSm; }}
                    onMouseUp={e => { e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; }}
                  >
                    <Copy className="w-4 h-4" /> Copy Story
                  </button>

                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 font-medium transition-all duration-300 cursor-pointer"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.shadowExtrudedSm,
                      borderRadius: '12px',
                      border: 'none',
                      padding: '10px 20px',
                      color: NEU.textHeading,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    onMouseDown={e => { if(!loading) e.currentTarget.style.boxShadow = NEU.shadowInsetSm; }}
                    onMouseUp={e => { if(!loading) e.currentTarget.style.boxShadow = NEU.shadowExtrudedSm; }}
                  >
                    <Sparkles className="w-4 h-4" /> Continue Story
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6" style={{ background: NEU.bg, boxShadow: NEU.shadowInset, borderRadius: '16px', minHeight: '300px' }}>
                <div className="w-16 h-16 mb-4 flex items-center justify-center" style={{ background: NEU.bg, boxShadow: NEU.shadowExtrudedSm, borderRadius: '50%' }}>
                  <Sparkles className="w-8 h-8" style={{ color: NEU.textMuted }} />
                </div>
                <p className="text-center px-6" style={{ color: NEU.textMuted }}>
                  {loading
                    ? "The AI is weaving your story... Patience, great tales take a moment!"
                    : "Your story will appear here. Enter a prompt and click Generate!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-10 p-6" style={{ background: NEU.bg, boxShadow: NEU.shadowExtruded, borderRadius: '24px' }}>
          <h3 className="font-semibold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NEU.textHeading }}>
            💡 How it works:
          </h3>
          <ul className="list-disc pl-5 space-y-1" style={{ color: NEU.textMuted }}>
            <li>Type a story prompt above (in any language)</li>
            <li>Our AI model generates a unique folklore story</li>
            <li>Stories are inspired by indigenous narrative traditions</li>
            <li>You can copy, share, or save your generated stories</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
