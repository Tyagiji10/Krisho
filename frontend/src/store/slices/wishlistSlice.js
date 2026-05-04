import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const toggleWishlistAsync = createAsyncThunk(
  'wishlist/toggle',
  async (product, { getState }) => {
    const { auth: { userInfo } } = getState();
    if (!userInfo) throw new Error('Not authenticated');

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.post('/api/wishlist/toggle', { product }, config);
    return data; // This is now the full array of wishlist items
  }
);

const getInitialWishlist = () => {
  try {
    const stored = localStorage.getItem('wishlist');
    if (!stored || stored === 'undefined') return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing wishlist from storage', error);
    return [];
  }
};

const wishlistFromStorage = getInitialWishlist();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: wishlistFromStorage, loading: false },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('wishlist', JSON.stringify(action.payload));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleWishlistAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Just set the new items
        localStorage.setItem('wishlist', JSON.stringify(action.payload));
      })
      .addCase(toggleWishlistAsync.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
