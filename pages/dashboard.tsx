'use client';
import { AppPageProps, Mode, Type } from '@/types/globals';
import { Avatar, Button, TextField, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { GroupData, Group, Member } from '@/schema';
import LargeBaseCard from '@/components/bases/LargeBaseCard';
import Header from '@/components/layout/Header';
import { Search } from '@mui/icons-material';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';

export default function Dashboard(props: AppPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));

  const [bases, setBases] = useState<Member[] | null>(null);

  const columns = 3; // Number of columns in the grid
  const delayStep = 100; // Delay in ms between each animation

  useEffect(() => {
    if (!props.Session.bases) {
      return;
    }
    // const alphaOrder = props.Session.bases.sort((a, b) => a.name.localeCompare(b.name))
    setBases(props.Session.bases);
  }, [props.Session.bases]);

  return (
    <>
      <Header {...props}>
        <div className='flex fit' key={"nothing_here"}>

        </div>
      </Header >
      <div id="content" className={`${isMD ? 'column' : 'flex'} top center`}
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: isMD ? "5rem 1.5rem" : "8rem",
          width: "45rem",
          maxWidth: "100%"
        }} >
        <div className={`column top `} style={{
          maxWidth: "80rem",
          minHeight: "100vh"
        }}>
          <div className="column top" style={{
            marginBottom: '3rem'
            // minHeight: "50vh"
          }}>
            <Typography variant="h3" sx={{ width: "100%" }}>{dayjs().format("h:mm A")}</Typography>
            <Typography variant="h6" sx={{ width: "100%" }}>{dayjs().format("MMM D, YYYY")}</Typography>
            <hr style={{
              width: "100%",
              height: "1px",
              borderColor: theme.palette.divider
            }}></hr>
            {props.Session.session && (
              <div className="flex center fit">
                <Avatar
                  src={`${MEDIA_BASE_URI}/${props.Session.session.getIconPath()}`}
                  sx={{ width: "3rem", height: "3rem" }} />
                <div className="column snug">
                  <Typography sx={{ fontWeight: 700 }}>{props.Session.session.name}</Typography>
                  <Typography variant="caption">{props.Session.session.username}</Typography>
                </div>
              </div>
            )}
          </div>
          <div className="column relaxed" >
            <div className="column compact">
              {/* <TextField
                sx={{
                  '& .MuiFilledInput-input': {
                    padding: "12px 0 12px 12px"
                  }
                }}
                placeholder="Search"
                variant="filled"
                fullWidth
                name="Search"
                aria-label="Search"
                onChange={async (e) => {
                  if (!e.target.value || e.target.value === "") {
                    setBases(props.Session.bases)
                    return;
                  }
                  const filteredBySearch = props.Session.search(e.target.value);
                  setBases(filteredBySearch);
                  // setFilter("search");
                }}
                InputProps={{
                  startAdornment: (
                    <Search fontSize="small" />
                  ),

                }}
              /> */}
              {/* {(bases && props.Session.bases) && bases.length < props.Session.bases.length && (
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  onClick={() => setBases(props.Session.bases)}
                >Clear</Button>
              )} */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  props.Session.Creator.startCreator(Type.Group, Mode.Create, new Group({
                    theme_color: theme.palette.primary.main
                  }), {
                    callback: (newGroup: GroupData) => props.Session.addNewBase(newGroup)
                  })
                }}
              >New Group</Button>
            </div>
            <div className='flex compact2' style={{
              flexWrap: 'wrap',
              marginBottom: '5rem'
            }}>
              {bases && bases.map((m, index) => {

                const row = Math.floor(index / columns);
                const col = index % columns;

                // Compute animation delay
                const delay = (row + col) * delayStep;

                return m instanceof Group ? (
                  <LargeBaseCard
                    key={m.uuid}
                    style={{
                      width: "calc(33% - (0.55rem / 3))",
                      marginBottom: "0.33rem",
                      animation: `popIn 0.5s ease forwards`,
                      animationDelay: `${delay}ms`,
                      transform: "scale(0)",
                      opacity: 0,
                    }}
                    groupMember={m}
                    onClick={async () => {
                      await props.Session.changeBase(m)
                      router.push(`/be/${m.id()}`)
                    }}
                  />
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
