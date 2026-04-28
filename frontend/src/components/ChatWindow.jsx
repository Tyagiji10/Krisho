import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Send, X, MessageSquare, User, Trash2 } from 'lucide-react';

import { createPortal } from 'react-dom';

/**
 * A floating/slide-out real-time direct messaging panel
 */
const ChatWindow = ({ supplierId, supplierName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const chatEndRef = useRef(null);

  // Setup polling or socket.io
  useEffect(() => {
    if (!supplierId || !userInfo) return;

    const fetchMessages = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/messages/${supplierId}`, config);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Fallback polling
    return () => clearInterval(interval);
  }, [supplierId, userInfo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/messages', {
        receiverId: supplierId,
        text: newMessage.trim(),
      }, config);

      setMessages([...messages, data]);
      setNewMessage('');
      if (navigator.vibrate) navigator.vibrate(20);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!userInfo) return null;

  return createPortal(
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[9999] w-[calc(100vw-2rem)] max-w-[360px] h-[450px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-border dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-xl text-white">
            <User size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{supplierName || 'Farmer'}</h4>
            <p className="text-[9px] text-white/80 font-bold">Direct Agri Trade Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMessages([])} className="p-1 rounded-lg hover:bg-white/20 transition-colors" title="Clear Chat">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Message history */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900">
        {loading ? (
          <p className="text-center text-xs text-slate-400 mt-4">Connecting to secure channel...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <MessageSquare size={28} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold">No messages yet. Say hello! 🌾</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userInfo._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs font-bold leading-relaxed ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border dark:border-slate-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 outline-none focus:border-primary dark:text-white font-bold"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20">
          <Send size={16} />
        </button>
      </form>
    </div>,
    document.body
  );
};

export default ChatWindow;
