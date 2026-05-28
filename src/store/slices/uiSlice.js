import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    navbarMobileOpen: false,
    navbarScrolled: false,
    navbarSearch: '',
    adminMobileOpen: false,
    adminShowUserMenu: false,
    adminRefreshing: false,
    sidebarCollapsed: false,
    languageIsFrench: true,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setNavbarMobileOpen: (state, action) => {
      state.navbarMobileOpen = action.payload;
    },
    toggleNavbarMobile: (state) => {
      state.navbarMobileOpen = !state.navbarMobileOpen;
    },
    setNavbarScrolled: (state, action) => {
      state.navbarScrolled = action.payload;
    },
    setNavbarSearch: (state, action) => {
      state.navbarSearch = action.payload;
    },
    setAdminMobileOpen: (state, action) => {
      state.adminMobileOpen = action.payload;
    },
    toggleAdminMobile: (state) => {
      state.adminMobileOpen = !state.adminMobileOpen;
    },
    setAdminShowUserMenu: (state, action) => {
      state.adminShowUserMenu = action.payload;
    },
    toggleAdminUserMenu: (state) => {
      state.adminShowUserMenu = !state.adminShowUserMenu;
    },
    setAdminRefreshing: (state, action) => {
      state.adminRefreshing = action.payload;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setLanguageIsFrench: (state, action) => {
      state.languageIsFrench = action.payload;
    },
    toggleLanguage: (state) => {
      state.languageIsFrench = !state.languageIsFrench;
    },
  },
});

export const {
  toggleTheme, setTheme,
  setNavbarMobileOpen, toggleNavbarMobile,
  setNavbarScrolled, setNavbarSearch,
  setAdminMobileOpen, toggleAdminMobile,
  setAdminShowUserMenu, toggleAdminUserMenu,
  setAdminRefreshing,
  setSidebarCollapsed, toggleSidebar,
  setLanguageIsFrench, toggleLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
