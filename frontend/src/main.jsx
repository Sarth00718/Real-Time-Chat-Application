
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import { Toaster } from "react-hot-toast";
import './index.css';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist';
import axios from 'axios';

let persistor = persistStore(store);

axios.defaults.withCredentials = true;
// axios.defaults.baseURL = 'https://real-time-chat-application-hwsq.onrender.com';
export const BASE_URL = 'https://real-time-chat-application-hwsq.onrender.com'
//export const BASE_URL = 'http://localhost:3000';


const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster />
      </PersistGate>
    </Provider>
  </StrictMode>
);
