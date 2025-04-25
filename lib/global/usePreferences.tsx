"use client"
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export interface UsePreferences {
  mode: string,
  toggleMode: () => void,
  isSidebarDocked: boolean,
  setIsSidebarDocked: Dispatch<SetStateAction<boolean>>
}

export default function usePreferences(): UsePreferences {
  const theme = useTheme();
  const [mode, setMode] = useState('light');
  const isLg = useMediaQuery(theme.breakpoints.down('lg'));
  const [isSidebarDocked, setIsSidebarDocked] = useState<boolean>(true);

  useEffect(() => {
    if (isLg) {
      setIsSidebarDocked(false);
    }
    else {
      setIsSidebarDocked(true)
    }
  }, [isLg]);

  const toggleMode = () => {
    setMode(prev => {
      return prev === 'light' ? 'dark' : 'light'
    })
  }


  return {
    mode,
    toggleMode,
    isSidebarDocked,
    setIsSidebarDocked
  };
}
