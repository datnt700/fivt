'use client';
import React, { createContext, ReactNode, useState } from 'react';

interface ThemeContextProps {
  isDarkModeChecked: boolean;
  setLightTheme: () => void;
  setDarkTheme: () => void;
}

const defaultValue: ThemeContextProps = {
  isDarkModeChecked: false,
  setLightTheme: () => {},
  setDarkTheme: () => {}
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextProps>(defaultValue);
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkModeChecked, setDarkModeChecked] = useState(false);

  const setDarkTheme = () => {
    const theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    setDarkModeChecked(true);
  };

  const setLightTheme = () => {
    const theme = 'light';
    document.documentElement.setAttribute('data-theme', theme);
    setDarkModeChecked(false);
  };

  return (
    <ThemeContext.Provider value={{ isDarkModeChecked, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
