import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/themeSlice"; // Добавляем тему
import { toggleTheme } from "../features/themeSlice";
import productsReducer from "../features/productsSlice";
export const store = configureStore({
 reducer: {
 products: productsReducer,
 theme: themeReducer, 
 },
});