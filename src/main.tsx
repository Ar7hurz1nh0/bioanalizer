/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render<React.ExoticComponent>(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementsByTagName('main')[0]!
);
