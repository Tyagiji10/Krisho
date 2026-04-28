import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, isOpen]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { role: 'user', parts: [{ text: message }] };
    const updatedHistory = [...chatHistory, userMsg];
    
    setChatHistory((prev) => [...prev, { role: 'user', text: message }]);
    setMessage('');
    setLoading(true);

    try {
      const formattedHistoryForBackend = updatedHistory.map(item => ({
        role: item.role,
        parts: item.parts || [{ text: item.text }]
      }));

      const { data } = await axios.post('/api/ai/chat', {
        message,
        history: formattedHistoryForBackend
      });

      setChatHistory((prev) => [...prev, { role: 'model', text: data.response }]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [...prev, { role: 'model', text: 'Failed to fetch response. Please retry.' }]);
    } finally {
      setLoading(false);
    }
  };

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
          className="fixed left-1/2 -translate-x-1/2 bottom-20 md:left-auto md:translate-x-0 md:right-6 md:bottom-24 z-50 w-[calc(100%-2rem)] sm:w-[380px] h-[400px] md:h-[480px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        >
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm">Krisho AI Helper</h3>
              <p className="text-[10px] text-white/80">Agriculture & Marketplace Expert</p>
            </div>
            <button onClick={() => setChatHistory([])} className="ml-auto mr-2 text-white/80 hover:text-white transition-colors" title="Clear Chat">
              <Trash2 size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900">
            {chatHistory.length === 0 && (
              <div className="space-y-4 pt-4">
                <p className="text-center text-xs text-slate-400">Ask me about crop pricing, setup tips, or farming advice!</p>
                {/* Quick prompt chips */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '🌿 Best crops for summer',
                    '📈 How to price my produce',
                    '🚜 Govt schemes for farmers',
                    '📦 Reduce delivery costs',
                  ].map(chip => (
                    <button
                      key={chip}
                      onClick={() => setMessage(chip.replace(/^[^ ]+ /, ''))}
                      className="text-left px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all leading-snug"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border'}`}>
                  <p className="text-xs md:text-sm font-medium break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2 relative">
            <input 
              type="text"
              placeholder="Type your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-sm outline-none dark:text-white placeholder-slate-400"
            />
            <button type="submit" className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
