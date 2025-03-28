import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./styles/darklight.css";
import { store } from "./store/store.js";

console.log("Реакт загружается");

const Root = () => {
  // Получаем текущую тему из Redux
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div className={theme}>
      <App />
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
