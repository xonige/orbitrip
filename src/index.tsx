import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; 
import './index.css';



const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: 'root' element not found in index.html");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
      <App />
  );
}