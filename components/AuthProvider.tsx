"use client"
import useBase, { UseBase } from '@/lib/global/useBase';
import useSession, { UseSession } from '@/lib/global/useSession';
import { CircularProgress, LinearProgress, ThemeProvider, Typography, createTheme, lighten, useMediaQuery, useTheme } from '@mui/material';
import { NextComponentType, NextPageContext } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import React, { useEffect, useRef, useState } from 'react';
import { Event, Member } from "@/schema";
import Sidebar from './layout/Sidebar';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSnackbar } from 'notistack';
import UnAuthProvider from './UnAuthProvider';
import { Mode, Type } from '@/types/globals';
import dayjs from 'dayjs';
import AppLayout from './AppLayout';

const sora = Source_Sans_3({ subsets: ['latin'] });
const protectedPaths = ['/be/', '/at/', 'be/at/'];
const unprotected = ['/login', '/register', '/', '/theme', 'test'];

const session_protected = ['/dashboard', '/me'];

const prefixToType = (path: string) => {
  if (path.startsWith('/be/')) {
    return Type.Group;
  }
  else if (path.startsWith('/event/')) {
    return Type.Event;
  }
  else if (path.startsWith('/at/')) {
    return Type.Location
  }
  return null;
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    light: true;
    flipped: true;
    outlined_flipped: true;
    invert: true;
  }
}





const Pages = {
  '/': "unprotected",
  '/login': "unprotected",
  '/register': "unprotected",
  '/be/[base]': "protected",
}

export default function AuthProvider({
  Component,
  pageProps,
}: {
  Component: NextComponentType<NextPageContext, any, any>;
  pageProps: any;
}) {

  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 15
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 0
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const Session: UseSession = useSession();
  const [module, setModule] = useState<Member | null>(null);
  const Base: UseBase = useBase(Session.base, Session, Session.setBase, false);
  const Module = useBase(module, Session, setModule, true, Base, Session.base);


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    try {
      console.log({ active, over })

      if (!over || !over.data.current) {
        return;
      }
      if (over && over.id === 'event_page_drop') {
        over.data.current.callback(active.data.current);
      }
    }
    catch (err) {
      console.log("Drag-n-drop failed.");
    }
  }

  useEffect(() => {

    const handleKeyPress = (event: KeyboardEvent) => {

      try {
        if (Module.Creator.isOpen || Base.Creator.isOpen) {
          return;
        }

        if (event.key === "n") {

          const preset = new Event({
            date: dayjs().yyyymmdd(),
            start_time: String(9),
            end_time: String(10)
          }, true);

          if (module) {
            Module.Creator.startCreator(Type.Event, Mode.Create, preset);
            return;
          }
          Base.Creator.startCreator(Type.Event, Mode.Create, preset);
        }
      }
      catch (err) {
        enqueueSnackbar("Reload the page.", {
          variant: "error"
        })
        return;
      }

    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Base, Module])


  useEffect(() => {

    if (router.asPath.startsWith("/be/[base]")) {
      return;
    }

    if (router.asPath.startsWith("/at/[location]")) {
      return;
    }

    if (router.asPath.startsWith("/event/[event]")) {
      return;
    }

    let base_path = router.query.base ? String(router.query.base) : router.query.module ? String(router.query.module) : undefined;



    // Session protected only
    if (base_path || session_protected.some(path => router.pathname.startsWith(path))) {
      Session.verify(base_path ? {
        value: base_path,
      } : null)
        .then((res: boolean) => {
          if (!res) {
            if (router.asPath != '/login') {
              router.push('/login')
              return;
            }
          }
          console.log("Case 0")
          return;
        })
        .catch(err => {
          // router.push('/me')
        })
      return;
    }

    // Session & Base protected
    else if (!unprotected.some(path => router.pathname === path) && !router.pathname.startsWith('/about')) {
      if (!Session.session) {
        Session.verify(base_path ? {
          value: base_path,
        } : null)
        .then((res: boolean) => {
          if (!res) {
            // router.push('/me')
          }
          console.log({
            message: "Case 2",
            res
          })
          return;
        })
        .catch(err => {
          // router.push('/me')
        })

      } else {
        if (router.pathname.startsWith('/dashboard')) return;
        console.log("Case 3");
      }
      return;
    } else {
      if (router.pathname.startsWith('/register')) return;
      console.log("Case 4")
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  if (unprotected.some(path => router.pathname === path) || router.pathname.startsWith('/about')) {
    return (
      <ThemeProvider
        theme={Session.Preferences.mode === 'light' ? theme : theme}
      >
        <style jsx global>{`
          html {
            font-family: ${sora.style.fontFamily};
            }
            `}</style>
        <div className="column snug bottom" style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: Session.Preferences.mode === 'light' ? theme.palette.background.paper : theme.palette.background.paper
        }}>
          <UnAuthProvider Component={Component} {...pageProps} Session={Session} />
        </div>
      </ThemeProvider>
    );
  }

  if (!Session || Session.loading || !Session.session) {
    return (
      <div className='column center middle' style={{ height: "100vh", width: "100vw", color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}>
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
        <Typography>{router.pathname}</Typography>
        <Typography variant="caption">Belong Platforms LLC. 2025</Typography>
      </div>
    )
  }


  if (session_protected.some(path => router.pathname.startsWith(path))) {

    if (!Session.session) {
      return (
        <div className='column center middle' style={{ height: "100vh", width: "100vw", color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}>
          <CircularProgress sx={{ color: theme.palette.text.primary }} />
          <Typography variant="caption">Belong Platforms LLC. 2025</Typography>
        </div>
      )
    }

    return (
      <>
        <style jsx global>{`
            html {
              font-family: ${sora.style.fontFamily};
            }
            `}</style>
        <ThemeProvider
          theme={Session.theme}
        >
          <NextNProgress color={Session.theme.palette.primary.main}
            height={2}
          />
          <AppLayout
            Session={Session as any}
          >
            <UnAuthProvider Component={Component} {...pageProps} Session={Session} />
          </AppLayout>
        </ThemeProvider>

      </>
    );
  }



  if (!Base || Base.loading || !Session.base) {
    return (
      <div className='column center middle' style={{ height: "100vh", width: "100vw", color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}>
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
        <Typography variant="caption">Belong Platforms LLC. 2025</Typography>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
          html {
            font-family: ${sora.style.fontFamily};
          }
        `}</style>
      <ThemeProvider theme={Base.theme}>
        <NextNProgress color={Base.theme.palette.primary.main}
          height={2}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          autoScroll={false}
        >
          <AppLayout
            Session={Session as any}
            Base={Base}
            Module={Module}
            module={module as any}
            setModule={setModule}
          >
            <Component
              {...pageProps}
              setModule={setModule}
              module={module}
              Session={Session}
              Base={Base}
              Module={Module}
            />
          </AppLayout>
        </DndContext>
      </ThemeProvider>
    </>
  );
}
