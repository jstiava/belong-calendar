"use client"
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';
import { Typography, useTheme, Link, useMediaQuery } from '@mui/material';
import { Sora } from 'next/font/google';
import { UseSession } from '@/lib/global/useSession';


const sora = Sora({ subsets: ['latin'] });

export default function Home(props: { Session: UseSession, activeTab: string }) {
  const router = useRouter();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isThingsToDoHovered, setIsThingsToDoHovered] = useState(false);

  return (
    <>
      <div id="content" style={{ position: 'relative', padding: isSM ? "1rem 1.5rem" : "1rem 2rem", marginTop: "5rem", color: theme.palette.text.primary }}>
        <div className="column relaxed" style={{ alignItems: "center" }}>

          <div className="column compact center" style={{ padding: "7rem 0 1rem 0" }}>

            
            <Typography variant="h3" sx={{
              display: 'inline',
              // position: "absolute",
              zIndex: 1,
              maxWidth: "45rem",
              width: "95%"
            }}><Link variant="h3"
              onMouseEnter={() => {
                setIsThingsToDoHovered(true);
              }}
              onMouseLeave={() => {
                setIsThingsToDoHovered(false);
              }}
              className="hover-underline"
              sx={{
                display: 'inline',
                backgroundImage: `linear-gradient(#00000000, #00000000), linear-gradient(${theme.palette.text.primary}, ${theme.palette.text.primary})`,
                textDecoration: `none`,
                backgroundSize: `100% 0.15rem, 0 0.15rem`,
                backgroundPosition: `100% 90%, 0 90%`,
                backgroundRepeat: `no-repeat`,
                transition: `background-size .3s`,
                color: theme.palette.text.primary,
                cursor: "pointer",
                whiteSpace: "pre-line",
                fontWeight: 800
              }}>Things to do.</Link> <Link variant="h3"
                className="hover-underline"
                sx={{
                  display: 'inline',
                  backgroundImage: `linear-gradient(#00000000, #00000000), linear-gradient(${theme.palette.text.primary}, ${theme.palette.text.primary})`,
                  textDecoration: `none`,
                  backgroundSize: `100% 0.15rem, 0 0.15rem`,
                  backgroundPosition: `100% 90%, 0 90%`,
                  backgroundRepeat: `no-repeat`,
                  transition: `background-size .3s`,
                  color: theme.palette.text.primary,
                  cursor: "pointer",
                  whiteSpace: "pre-line",
                  fontWeight: 800
                }}>Places to <span style={{ color: theme.palette.primary.main }}>be.</span></Link> <br />Where people <span style={{ color: theme.palette.primary.main }}>belong.</span></Typography>
          </div>
          <div style={{ height: "3rem" }}></div>


          <div style={{ height: "1rem" }}></div>

        </div>

      </div>
    </>
  );
}
