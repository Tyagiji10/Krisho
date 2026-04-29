import { useState, useEffect } from 'react';
import { Star, X, User, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReviewModal = ({ supplierId, supplierName, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { userInfo } = useSelector(state => state.auth);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/reviews/${supplierId}`);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [supplierId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert('Please login to add a review');
      return;
    }
    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/reviews', { supplierId, rating, comment }, config);
      setComment('');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto max-h-[90vh]"
      >
        {/* Left Side: Reviews List */}
        <div className="flex-grow p-6 md:p-8 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-border dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="text-secondary" fill="currentColor" size={20} />
              {supplierName}'s Reviews
            </h2>
            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="bg-slate-50 dark:bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={24} />
                </div>
                <p className="text-sm font-bold">No reviews yet.</p>
                <p className="text-xs">Be the first to rate this farmer!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-border dark:border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                        {review.consumerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{review.consumerName}</p>
                        <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-secondary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Add Review Form */}
        <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-900/20 p-6 md:p-8 shrink-0 relative">
          <button onClick={onClose} className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
          
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Rate this Farmer</h3>
          
          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-all ${rating >= star ? 'text-secondary scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-secondary/50'}`}
                  >
                    <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Your Comment</label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this farmer's products..."
                className="w-full h-32 p-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl outline-none focus:border-primary text-sm dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !userInfo}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'Posting...' : <><Send size={16} /> Post Review</>}
            </button>
            
            {!userInfo && (
              <p className="text-[10px] text-center text-red-400 font-bold uppercase tracking-widest mt-2">Login to Review</p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewModal;
