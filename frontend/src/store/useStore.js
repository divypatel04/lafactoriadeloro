import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user and auth
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),

      // Logout
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // Update user
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      // Cart state
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0
      },

      setCart: (cart) => set({ cart }),

      // Wishlist state
      wishlist: [],
      setWishlist: (wishlist) => set({ wishlist }),

      // Add to wishlist
      addToWishlist: (productId) => set((state) => ({
        wishlist: [...state.wishlist, productId]
      })),

      // Remove from wishlist
      removeFromWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.filter(id => id !== productId)
      })),

      // Categories
      categories: [],
      setCategories: (categories) => set({ categories })
    }),
    {
      name: 'lafactoria-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useStore;
