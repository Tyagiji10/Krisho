import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Trash2, Mic, MicOff, Volume2, Globe } from 'lucide-react';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

const AIAssistant = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('hi') ? 'hi' : 'en'); // 'en' or 'hi'
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync with global language
  useEffect(() => {
    setLanguage(i18n.language.startsWith('hi') ? 'hi' : 'en');
  }, [i18n.language]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      let finalTranscriptCaptured = '';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const fullText = finalTranscript || interimTranscript;
        setMessage(fullText);
        if (finalTranscript) finalTranscriptCaptured = finalTranscript;
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscriptCaptured) {
          sendMessage(finalTranscriptCaptured);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatWindowRef.current && 
        !chatWindowRef.current.contains(event.target) && 
        toggleButtonRef.current && 
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Listen for events from BottomNavbar
  useEffect(() => {
    const handleToggleEvent = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('toggle-ai-chat', handleToggleEvent);
    return () => {
      window.removeEventListener('toggle-ai-chat', handleToggleEvent);
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'hi' ? 'आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता' : 'Your browser does not support voice input');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakResponse = (text) => {
    if (!window.speechSynthesis || !text) return;
    
    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (language === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.lang.includes('IN') || v.name.includes('India')));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (textToSend) => {
    const msgText = textToSend || message;
    if (!msgText.trim()) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = { role: 'user', parts: [{ text: msgText }] };
    const updatedHistory = [...chatHistory, userMsg];
    
    setChatHistory((prev) => [...prev, { role: 'user', text: msgText }]);
    setMessage('');
    setLoading(true);

    try {
      const formattedHistoryForBackend = updatedHistory.map(item => ({
        role: item.role,
        parts: item.parts || [{ text: item.text }]
      }));

      const { data } = await axios.post('/api/ai/chat', {
        message: msgText,
        history: formattedHistoryForBackend,
        language
      });

      setChatHistory((prev) => [...prev, { role: 'model', text: data.response }]);
      
      // Auto-speak the AI response
      speakResponse(data.response);
    } catch (error) {
      console.error(error);
      const errMsg = language === 'hi' ? 'जवाब लाने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to fetch response. Please retry.';
      setChatHistory((prev) => [...prev, { role: 'model', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const quickPromptsEN = [
    '🌿 Best crops for summer',
    '📈 How to price my produce',
    '🚜 Govt schemes for farmers',
    '📦 Reduce delivery costs',
  ];

  const quickPromptsHI = [
    '🌿 गर्मियों के लिए सबसे अच्छी फसलें',
    '📈 अपनी उपज की कीमत कैसे तय करें',
    '🚜 किसानों के लिए सरकारी योजनाएं',
    '📦 डिलीवरी खर्च कैसे कम करें',
  ];

  const quickPrompts = language === 'hi' ? quickPromptsHI : quickPromptsEN;

  return (
    <>
      {/* Floating Button */}
      <button 
        ref={toggleButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 hidden md:flex items-center justify-center rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 bg-primary hover:scale-105 active:scale-95 text-white ${
          isOpen ? 'right-6 bottom-[450px] md:bottom-[520px] p-3' : 'right-6 bottom-6 p-4'
        }`}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className="fixed left-1/2 -translate-x-1/2 bottom-20 md:left-auto md:translate-x-0 md:right-6 md:bottom-24 z-50 w-[calc(100%-2rem)] sm:w-[380px] h-[400px] md:h-[480px] bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        >
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm">Krisho AI Helper</h3>
              <p className="text-[10px] text-white/80">
                {language === 'hi' ? 'कृषि और बाज़ार विशेषज्ञ' : 'Agriculture & Marketplace Expert'}
              </p>
            </div>
            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1"
              title="Switch Language"
            >
              <Globe size={12} />
              {language === 'hi' ? 'EN' : 'हिं'}
            </button>
            <button onClick={() => setChatHistory([])} className="text-white/80 hover:text-white transition-colors" title="Clear Chat">
              <Trash2 size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-background">
            {chatHistory.length === 0 && (
              <div className="space-y-4 pt-4">
                <p className="text-center text-xs text-slate-400">
                  {language === 'hi' 
                    ? 'फसल, कीमत, या खेती से जुड़ा कोई भी सवाल पूछें!' 
                    : 'Ask me about crop pricing, setup tips, or farming advice!'}
                </p>
                {/* Quick prompt chips */}
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setMessage(chip.replace(/^[^ ]+ /, ''))}
                      className="text-left px-3 py-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all leading-snug"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-card text-slate-700 dark:text-slate-200 border border-border'}`}>
                  <p className="text-xs md:text-sm font-medium break-words">{msg.text}</p>
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakResponse(msg.text)}
                    className="p-1 text-slate-400 hover:text-primary transition-colors shrink-0 mt-1"
                    title={language === 'hi' ? 'सुनें' : 'Listen'}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
                <span className="text-xs">{language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-border bg-white dark:bg-card flex gap-2 relative">
            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                  : 'bg-slate-100 dark:bg-muted text-slate-500 dark:text-slate-400 hover:text-primary'
              }`}
              title={language === 'hi' ? (isListening ? 'रोकें' : 'बोलकर टाइप करें') : (isListening ? 'Stop' : 'Voice Input')}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input 
              type="text"
              placeholder={language === 'hi' ? 'अपना सवाल टाइप करें या बोलें...' : 'Type or speak your question...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-muted px-4 py-2.5 rounded-xl text-sm outline-none dark:text-white placeholder-slate-400"
            />
            <button type="submit" className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors shrink-0">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
