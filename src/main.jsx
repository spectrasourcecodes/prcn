import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserAuthProvider } from './auth/userAuth';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserAuthProvider>
      <App />
    </UserAuthProvider>
  </React.StrictMode>
);