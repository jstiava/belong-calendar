"use client"
import React, { } from 'react';
import { AppProps } from 'next/app';
import '@/style.scss';
import "editorjs-mention-tool/src/styles.css"
import '@/lib/MapExtension';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AuthProvider from '@/components/AuthProvider';
import { Source_Sans_3 } from 'next/font/google';
import { createTheme, lighten, ThemeProvider } from '@mui/material';

export const ss3 = Source_Sans_3({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }: AppProps) {

  // const clientId = '178207176567-epjahnmagdcfpnb0j27eskhu4rvl6e6c.apps.googleusercontent.com';

  return (
    <>
      <ThemeProvider
        theme={lightTheme}
      >
        <SnackbarProvider
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AuthProvider Component={Component} pageProps={pageProps} />
          </LocalizationProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}



const lightTheme = createTheme({
  palette: {
    primary: {
      main: "#0fd9c1",
    },
    secondary: {
      main: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          fontWeight: 700,
          variants: [
            {
              props: { variant: "outlined", color: "error" },
              style: {
                '&:hover': {
                  backgroundColor: "#FCEEEE"
                },
                backgroundColor: "#F9DDDD"
              }
            },
            {
              props: { variant: "text", color: "error" },
              style: {
                '&:hover': {
                  backgroundColor: "#FCEEEE"
                },
                backgroundColor: "#F9DDDD"
              }
            },
            {
              props: { color: 'light' },
              style: {
                '&:hover': {
                  backgroundColor: lighten("#0fd9c1", 0.8) || "#ffffff"
                },
                backgroundColor: lighten("#0fd9c1", 0.9) || "#ffffff"
              }
            },
            {
              props: { variant: 'invert' },
              style: {
                '&:hover': {
                  backgroundColor: lighten("#000000", 0.2),
                  color: "#0fd9c1"
                },
                backgroundColor: '#000000',
                color: "#0fd9c1"
              }
            },
            {
              props: { variant: 'invert', disabled: true },
              style: {
                '&:hover': {
                  backgroundColor: lighten("#000000", 0.2),
                  color: "#0fd9c1"
                },
                backgroundColor: '#00000025',
                color: '#000000',
              }
            }
          ]
        }
      },
    },
    MuiPopper: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
        },
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem"
        }
      }
    }
  },
  typography: {
    h3: {
      fontWeight: 800
    },
    h4: {
      fontWeight: 800
    },
    h5: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: "0.015rem"
    },
    fontFamily: [
      ss3.style.fontFamily,
      'sans-serif',
    ].join(','),
  },
  breakpoints: {
    values: {
      xs: 425,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920
    },
  },
});

const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: "#0fd9c1",
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          width: "fit-content",
          textTransform: "capitalize",
          padding: "0.25rem 1rem"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          variants: [
            {
              props: { variant: "outlined", color: "error" },
              style: {
                '&:hover': {
                  backgroundColor: "#B12E2E"
                },
                color: '#ffffff',
                backgroundColor: "#A02121"
              }
            },
            {
              props: { variant: "text", color: "error" },
              style: {
                color: '#EA8585',
                backgroundColor: "#00000000"
              }
            }
          ]
        }
      },
    }
  },
});