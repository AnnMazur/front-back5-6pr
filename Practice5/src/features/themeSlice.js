import { createSlice } from "@reduxjs/toolkit";
// Функция загрузки темы из LocalStorage
const loadThemeFromLocalStorage = () => {
 return localStorage.getItem("theme") || "light"; // По умолчанию светлая
тема
};
const themeSlice = createSlice({
 name: "theme",
 initialState: {
 mode: loadThemeFromLocalStorage(),
 },
 reducers: {
 toggleTheme: (state) => {
 state.mode = state.mode === "light" ? "dark" : "light";
 localStorage.setItem("theme", state.mode); // Сохраняем в LocalStorage
 },
 },
});
// Экспортируем actions и reducer
export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;