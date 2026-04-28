import { createSlice } from '@reduxjs/toolkit';

const wishlistFromStorage = localStorage.getItem('wishlist')
  ? JSON.parse(localStorage.getItem('wishlist'))
  : [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: wishlistFromStorage },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find(x => x._id === product._id);
      if (exists) {
        state.items = state.items.filter(x => x._id !== product._id);
      } else {
        state.items = [...state.items, product];
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
