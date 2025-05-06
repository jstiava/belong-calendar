"use client"
import { UseSession } from "@/lib/global/useSession";
import { Event, Member } from "@/schema";
import { Drawer, Button, Typography, useMediaQuery, useTheme, ButtonBase, lighten, Popover } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UseBase } from "@/lib/global/useBase";
import { useRouter } from "next/router";
import { AddOutlined, ArrowBackIosOutlined, ArrowForwardIosOutlined, CloseOutlined, HandshakeOutlined, MoreHorizOutlined, SettingsOutlined, SwitchAccountOutlined } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import StyledWeekPicker from "../calendar/WeekPicker";
import Divider, { DIVIDER_NO_ALPHA_COLOR } from "../Divider";
import dayjs from "@/lib/utils/dayjs";
import ItemStub from "../ItemStub";
import StyledIconButton from "../StyledIconButton";
import { isEventCalendar, isMultiDayEvent } from "@/lib/CalendarDays";
import ColorPaletteSelector from "../accordions/ColorPaletteSelector";
import { Mode, Type } from "@/types/globals";
import { IntegrationTemplates } from "@/pages/me/integrations";

export const SIDEBAR_WIDTH = '20rem';

export interface SidebarProps {
  Session: UseSession;
  Base?: UseBase,
  Module?: UseBase,
  module?: Member;
  setModule?: Dispatch<SetStateAction<Member | null>>,
}

export default function Sidebar({
  Session,
  Base,
  Module,
  module,
  setModule
}: SidebarProps) {

  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isBaseViewOpen = Boolean(anchorEl);

  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  const Controller = router.asPath.startsWith('/me') ? Session : Base;

  const pushNewView = (tab: string) => {

    let theView = undefined;
    if (['month', 'week', 'day'].some(x => x === tab)) {
      theView = tab;
      tab = 'calendar';
    }

    const theModule = router.query.module;
    if (router.query.module) {
      delete router.query.module;
    }
    const { base, ...rest } = router.query;

    if (theModule && base) {
      rest.base = base;
    }

    const isSession = router.asPath.startsWith('/me');

    router.push({
      pathname: `${isSession ? `/me/` : `/be/${theModule ? `${String(theModule)}/` : Session.base?.id()}/`}${tab}`,
      query: { ...rest, view: theView }
    })
  };

  return (
    <>
      <Popover
        anchorEl={anchorEl}
        open={isBaseViewOpen}
        // placement='left-start'
        onClose={(e: any) => {
          e.stopPropagation();
          setAnchorEl(null)
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div
          className="column snug"
          style={{
            width: "20rem",
            borderRadius: "0.25rem",
            padding: '0.25rem',
            position: 'relative'
          }}>
          {Session.base && (

            <div style={{
              position: 'absolute',
              top: "0.5rem",
              right: "0.5rem"
            }}>
              <StyledIconButton
                title="Switch Projects"
                onClick={() => {
                  router.push('/me')
                }}
              >
                <SwitchAccountOutlined sx={{
                  fontSize: "1rem"
                }} />
              </StyledIconButton>
            </div>
          )}

          {Session.base && (

            <div className="column snug" style={{
              padding: '0.5rem'
            }}>
              <Typography sx={{
                fontSize: '1rem',
                fontWeight: 700
              }}>{Session.base.name}</Typography>
              <Typography sx={{
                fontSize: '0.875rem',
                textTransform: 'capitalize'
              }}>{Session.base instanceof Event ? Session.base.subtitle || Session.base.type : Session.base.type}</Typography>
            </div>
          )}
          {(Session.base && Session.session) && Session.base.integration && (
            <ButtonBase
              onClick={() => {
                const integration = IntegrationTemplates.find(x => x.slug === Session.base!.integration);

                if (!integration) {
                  enqueueSnackbar("No integration found", {
                    variant: "error"
                  })
                  return;
                }

                router.push({
                  pathname: integration.url,
                  query: {
                    ...integration.query,
                    redirect_uri: 'http://localhost:3000/api/v1/auth/callback',
                    state: JSON.stringify({
                      integration: integration.slug,
                      from: router.asPath,
                      base: Session.session?.id(),
                      type: Type.Profile
                    })
                  }
                })
              }}
              className="flex compact"
              sx={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem"
              }}
            >
              <HandshakeOutlined sx={{
                fontSize: "1rem"
              }} />
              <Typography>Renew</Typography>
            </ButtonBase>
          )}
          <ButtonBase

            onClick={() => {
              pushNewView('settings')
            }}
            className="flex compact"
            sx={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem"
            }}
          >
            <SettingsOutlined sx={{
              fontSize: "1rem"
            }} />
            <Typography>Settings</Typography>
          </ButtonBase>
        </div>
      </Popover>
      <Drawer
        // keepMounted
        hideBackdrop
        variant="persistent"
        anchor="left"
        open={Session.Preferences.isSidebarDocked}
        onClick={() => {
          if (isSm) {
            Session.Preferences.setIsSidebarDocked(false);
          }
        }}
        onClose={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}
        sx={{
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            width: isSm ? '100%' : SIDEBAR_WIDTH,
            left: 0,
            top: 0,
            height: `calc(100vh - env(safe-area-inset-top));`,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            zIndex: 5,
            borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
          },
        }}
      >
        <Divider sx={{
          height: "0.05rem"
        }} />
        <div id="sidebar_header"
          className="flex center between"
          style={{
            height: "3.5rem",
            borderBottom: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
            padding: "0 0.5rem 0 1rem"
          }}>
          <div className="flex fit" style={{
            width: 'calc(100% - 2.5rem)',
          }}>
            {router.asPath.startsWith('/me') ? (
              <ItemStub
                item={Session.session}
                parent={null}
                onClick={(e: any) => {
                  const target = e.currentTarget || e.target;
                  setAnchorEl(target)
                }}
              />
            ) : (
              <ItemStub
                item={module ? module : Session.base ? Session.base : Session.session}
                parent={module ? Session.base : null}
                onClick={(e : any) => {
                  const target = e.currentTarget || e.target;
                  setAnchorEl(target)
                }}
              />
            )}
          </div>
          <StyledIconButton
            title="Close Sidebar"
            onClick={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}>
            {isSm ? (
              <CloseOutlined sx={{
                fontSize: "1.25rem"
              }} />
            ) : (
              <ArrowBackIosOutlined sx={{
                fontSize: "0.875rem"
              }} />
            )}
          </StyledIconButton>
        </div>
        <div style={{
          position: "relative",
          height: "calc(100% - 3.5rem)",
          padding: "0.5rem 0"
        }}>
          <div className="flex center middle">
            {router.asPath.startsWith('/me') ? (
              <StyledWeekPicker
                mode="dark"
                Calendar={Session.Calendar}
                value={Session.Calendar.frameDate}
              />
            ) : (
              <StyledWeekPicker
                mode="dark"
                Calendar={module && Module ? Module.Calendar : Session.base && Base ? Base.Calendar : Session.Calendar}
                value={module && Module ? Module.Calendar.frameDate : Session.base && Base ? Base.Calendar.frameDate : Session.Calendar.frameDate}
              />
            )}
          </div>
          <div className="column" style={{
            padding: "1rem"
          }}>

            {module && setModule && (
              <ButtonBase
                key={'back'}
                className="flex left compact"
                sx={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
                onClick={() => {
                  const { base, module, ...rest } = router.query;
                  setModule(null);
                  router.push({
                    pathname: `/be/${Session.base?.id()}`,
                    query: rest
                  });
                }}
              >
                <ArrowBackIosOutlined sx={{
                  fontSize: "0.75rem",
                  color: `var(--text-color)`
                }} />
                <Typography variant="h6" sx={{
                  fontSize: '0.75rem'
                }}>Back</Typography>
              </ButtonBase>
            )}

            <div className="column compact2">


              <div className="flex between center">
                <Typography variant="h6" sx={{
                  fontSize: "0.75rem"
                }}>Calendars</Typography>
                <StyledIconButton

                  title={"New Calendar"}
                  onClick={() => {
                    Controller?.Creator.startCreator(Type.Event, Mode.Create, new Event({
                      date: null,
                      start_time: null,
                      end_time: null,
                      end_date: null,
                      schedules: []
                    }))
                  }}
                >
                  <AddOutlined sx={{
                    fontSize: "1rem"
                  }} />
                </StyledIconButton>
              </div>
              <div className="column snug">
                {Controller && Controller.Events.events?.map((item) => {

                  if (!isEventCalendar(item) && !(isMultiDayEvent(item) && !item.date.isSame(item.end_date))) {
                    return null;
                  }

                  return (
                    <ButtonBase
                      key={item.id()}
                      className="column snug"
                      sx={{
                        padding: module && module.id() === item.id() ? "0.5rem" : "0.25rem 0.5rem",
                        margin: module && module.id() === item.id() ? '0.5rem 0 !important' : '0',
                        borderRadius: "0.25rem",
                        backgroundColor: module && module.id() === item.id() ? item.theme_color ? lighten(item.theme_color, 0.75) : 'transparent' : 'transparent'
                      }}
                      onClick={() => {
                        const pathParts = router.pathname.split('/');
                        const currentTab = pathParts[3];
                        const { base, module, ...rest } = router.query;
                        router.push({
                          pathname: `/be/${item.id()}${currentTab ? `/${currentTab}` : ``}`,
                          query: {
                            ...rest,
                            base: Session.base?.id()
                          }
                        })
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        Base?.Viewer.handleOpenEventPopover(Type.Event, item, {
                          e,
                          isRightClick: true
                        })
                      }}
                    >
                      <div className="flex between">
                        <div className="flex compact fit top" style={{
                          height: "fit-content",
                          width: "calc(100% - 3rem)"
                        }}>
                          <div style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            backgroundColor: item.theme_color ? item.theme_color : theme.palette.background.paper,
                            border: `0.05rem solid ${item.theme_color ? item.theme_color : theme.palette.text.primary}`,
                            borderRadius: "0.25rem"
                          }}></div>
                          <Typography variant="h6" sx={{
                            fontSize: "0.875rem",
                            textTransform: 'unset',
                            textAlign: 'left',
                            lineHeight: '115%',
                            width: "calc(100% - 3rem)"
                            
                          }}>{item.name}</Typography>
                        </div>
                        <StyledIconButton
                          title={"Expand/Collapse"}
                          onClick={undefined}
                        >
                          <ArrowForwardIosOutlined sx={{
                            fontSize: "0.75rem",
                            color: `var(--text-color)`,
                            transform: `rotate(90deg)`
                          }} />
                        </StyledIconButton>
                      </div>

                      {module && module.id() === item.id() && (
                        <div className="flex between bottom" style={{
                          padding: "0.5rem"
                        }}>
                          <Typography variant="h6" sx={{
                            fontSize: "0.75rem"
                          }}>{dayjs().format("MMM DD, YYYY")}</Typography>
                          <Button size="small" variant="contained" sx={{
                            backgroundColor: module.theme_color,
                            color: module.theme_color ? theme.palette.getContrastText(module.theme_color) : theme.palette.text.primary,
                            '&:hover': {
                              backgroundColor: module.theme_color ? lighten(module.theme_color, 0.25) : theme.palette.background.paper
                            }
                          }}>Today</Button>
                        </div>
                      )}

                    </ButtonBase>
                  )
                })}
              </div>
            </div>

            <div className="flex between bottom">
              <Typography variant="h6" sx={{
                fontSize: "0.75rem"
              }}>{dayjs().format("MMM DD, YYYY")}</Typography>
              <Button size="small" variant="contained">Today</Button>
            </div>

          </div>
          <div
            className="column compact"
            style={{
              position: 'absolute',
              bottom: 0,
              width: "100%",
              padding: "1rem"
            }}>
            <Button
              onClick={() => {
                router.push({
                  pathname: `/be/${Session.base?.id()}/integrations`,
                  query: { ...router.query, view: undefined }
                })
              }}
              endIcon={<MoreHorizOutlined />}
              sx={{
                color: theme.palette.text.primary
              }}
              className="flex between"
            >
              More Integrations
            </Button>
            <Button
              startIcon={<AddOutlined />}
              fullWidth
              variant="contained"
              onClick={() => {
                Controller?.Creator.startCreator(Type.Event, Mode.Create)
              }}
            >
              New Event
            </Button>
          </div>
        </div>
      </Drawer >
    </>
  )
}