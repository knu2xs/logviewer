import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import './styles/index.css';
import App from './App.tsx';

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: ['#f0f1ff', '#e4e6ff', '#cfd3ff', '#b3b8ff', '#9497ff', '#7678f5', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
    gray: ['#fbfbfd', '#f4f6fa', '#e7e9f2', '#d9dcee', '#b6bad0', '#8d92ad', '#5f5876', '#413a5a', '#2f2a45', '#1e1b2e'],
    red: ['#fdf2f2', '#fce5e3', '#f7cbc7', '#f1afa9', '#e88e84', '#dc6e63', '#cf4f43', '#c0392b', '#9f2f24', '#7d241d'],
    yellow: ['#fef8ef', '#fbedd4', '#f5dcb0', '#efca8b', '#e6b666', '#d89b44', '#c88730', '#b7791f', '#945f19', '#724814'],
    green: ['#eefbf6', '#dcf6ec', '#bcecd8', '#95dfbf', '#67cf9f', '#3dbb83', '#23ad75', '#0e9f6e', '#0c7f58', '#0b6447'],
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
);
