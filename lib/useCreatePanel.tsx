'use client';
import {
  Button,
  IconButton,
  TextField,
  Paper,
  Theme,
  Collapse,
  useMediaQuery,
  lighten,
  darken,
  createTheme,
  ThemeProvider,
  getContrastRatio,
  Typography,
  Avatar,
  alpha,
  AvatarGroup,
} from "@mui/material";
import React, { useState, useEffect, useRef, useCallback, memo, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Event, EventData, Group, ImageDisplayType, Member, MemberData, MemberFactory, Schedule } from "@/schema";
import { ArrowBack, CalendarMonthOutlined, Google, GroupWorkOutlined, LinkOutlined, PhotoLibraryOutlined, SaveOutlined, Star, StarOutline, TextFieldsOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { CreatePanelProps, CreatorModules, CreatorPanelMobileStyles, CreatorPanelProps, CreatorPanelStyles, SharedCreatorPanelStyles, StartCreator, UseCreateForm } from "./global/useCreate";
import { TransitionGroup } from 'react-transition-group';
import { UseSession } from "./global/useSession";
import { getIntegrationIcon, Mode, Type } from "@/types/globals";
import Chronos from "./utils/chronos";
import dayjs from "dayjs";
import axios, { API } from "./utils/axios";
import { UseBaseCore } from "./global/useBase";
import useIAM from "./global/useIAM";
import useComplexFileDrop, { MEDIA_BASE_URI, UploadType } from "./useComplexFileDrop";
import ColorPaletteSelector from "@/components/accordions/ColorPaletteSelector";
import DateTimeAccordionModule from "@/components/accordions/DateTimeAccordionModule";
import IAMAccordionModule from "@/components/accordions/IAMAccordionModule";
import LargeTextField from "@/components/LargeTextField";
import SmallTextField from "@/components/SmallTextField";


const ensureHttpsPrefix = (value: string): `https://${string}` => {
  // Remove any leading `#` and add exactly one
  return `https://${value.replace(/^https?:\/\//, '')}`;
};


const EventsCRUDPanels = [
  {
    name: "Header",

  }
]

export default function useCreatePanel(
  item: MemberData & CreatorPanelProps,
  source: Member,
  Base: UseBaseCore,
  Session: UseSession,
  startCreator: StartCreator,
  removePanel: (id: string) => void,
  setIsShareView: Dispatch<SetStateAction<boolean>>,
  setColor: any,
  Parent?: UseBaseCore,
  parent?: Member,

): UseCreateForm {

  const { theme, Events, Locations, ...OtherBase } = Base;
  const Modules = CreatorModules[item.type as Type]

  const inputRef = useRef<any>(null);
  const [newItem, setNewItem] = useState<(MemberData & CreatorPanelProps) | null>(item || null);
  const [expanded, setExpanded] = useState('dateTime');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isDialogOpen = Boolean(anchorEl);
  const [isSchedule, setIsSchedule] = useState(false);

  const theBuiltItem = new Event(item, true)
  const IAM = useIAM(theBuiltItem, true, source, parent);

  const [uploads, setUploads] = useState<UploadType[]>([]);
  const { FileUpload, FilePreview, handleUpload, openDialog, isUploadPresent, isFileUploadOpen, uploadCount } = useComplexFileDrop(MemberFactory.collect_media(item), uploads, setUploads);

  useEffect(() => {
    console.log(inputRef);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  useEffect(() => {

    if (!item.date) {
      setIsSchedule(true);
    }

    return () => {

      if (item.mode != Mode.Modify) {
        return;
      }

      axios.post(API.RELINQUISH_ITEM, {
        type: item.type,
        uuid: item.uuid
      })
        .then((res) => {
          return true;
        })
        .catch((err) => {
          console.log("Failed to relinquish edit lock.")
          return false;
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccordionChange = (key: string) => {
    return expanded === key ? setExpanded('') : setExpanded(key);
  };

  const handleChange = (eventOrName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value: any) => {
    if (typeof eventOrName === "string") {
      setNewItem((prev: any) => ({
        ...prev,
        [eventOrName]: value
      }));
      return;
    }
    if (!eventOrName.target.name) {
      return;
    }
    setNewItem((prev: any) => ({
      ...prev,
      [eventOrName.target.name]: value
    }));
  }

  const handleMultiChange = (values: Partial<EventData>) => {
    setNewItem((prev: any) => {
      if (!prev) {
        return values
      }
      return {
        ...prev,
        ...values
      }
    })
  }

  const handleMetadataChange = (eventOrName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value: any) => {
    if (typeof eventOrName === "string") {
      setNewItem((prev: any) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [eventOrName]: value
        }
      }));
      return;
    }

    if (!eventOrName.target.name) {
      return;
    }
    setNewItem((prev: any) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [eventOrName.target.name]: value
      }
    }));
  }


  const save = useCallback(async (copy: boolean = false) => {
    try {

      if (!item || !newItem) {
        throw Error("No item found");
      }

      if (typeof item.callback !== "function") {
        if (item.mode === Mode.Create) {
          item.callback = (x: MemberData) => Base.add(item.type, x);
        }
        else if (item.mode === Mode.Modify) {
          item.callback = (x: MemberData) => Base.update(item.type, x);
        }
      }

      if (!item.callback) {
        throw Error("Still no callback after trying to resolve.")
      }

      if (!source) {
        throw Error("No base")
      }

      const files = await handleUpload(`groups/${(source as any).username! || source.uuid}`);

      const { type = null, mode = null, callback = null, ...copyOfEvent } = { ...newItem }
      copyOfEvent.metadata = copyOfEvent.metadata || {};

      const icon = files.find(x => x.display_type === ImageDisplayType.Portrait);
      copyOfEvent.icon_img = icon || null;

      const cover = files.find(x => x.display_type === ImageDisplayType.Cover);
      copyOfEvent.cover_img = cover || null;

      const wordmark = files.find(x => x.display_type === ImageDisplayType.Wordmark);
      copyOfEvent.wordmark_img = wordmark || null;

      // if (isSchedule) {
      //   copyOfEvent.date = null;
      //   copyOfEvent.start_time = null;
      //   copyOfEvent.end_time = null;
      //   copyOfEvent.end_date = null;
      // }
      // else {
      //   copyOfEvent.schedules = [];
      // }

      copyOfEvent.location_name = null;
      copyOfEvent.location_place_id = null;
      copyOfEvent.location_address = null;

      await item.callback(copyOfEvent);
    }
    catch (err) {
      console.log(err)
      enqueueSnackbar("Action on event failed.", {
        variant: 'error'
      })
      throw Error("Failed")
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newItem,
    location,
    uploadCount,
    handleUpload
  ]);


  const Form = (
    <div
      className="column snug"
      style={{
        '--bg-color': newItem.theme_color || theme.palette.background.paper,
        '--text-color': theme.palette.getContrastText(newItem.theme_color || theme.palette.background.paper),
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        borderRadius: '0.5rem'
      }}
    >

      <div className="column relaxed" style={{
        padding: "1.5rem",
      }}>

        <Typography id="modal-title" variant="h2" className="visually-hidden">Create New Event</Typography>
        <Typography id="modal-description" className="visually-hidden">Enter a name, date and time, schedule, and creative additions.</Typography>

        <div className="flex between">

          <div className="flex compact fit">



            {Modules.header && Modules.header.map(x => {

              if (x === 'media') {
                return (
                  <IconButton key="media" onClick={() => openDialog()} style={{ position: "relative", height: "fit-content" }}>
                    <PhotoLibraryOutlined sx={{
                      color: "var(--text-color)"
                    }} />
                  </IconButton>
                )
              }

              if (x === 'theme_color') {
                return (
                  <ColorPaletteSelector
                    key={"theme_color"}
                    item={newItem}
                    handleChange={(e, newValue) => {
                      handleChange(e, newValue);
                      setColor(newValue)
                    }}
                  />
                )
              }

            })}

          </div>

          <div className="flex compact fit">
            {Modules.header && Modules.header.map((x : any) => {

              if (x === 'share' && IAM) {

                if (!IAM.members) {
                  return null;
                }
                return (

                  <AvatarGroup

                    total={Math.min(IAM.members.length, 3) + 1}
                    max={Math.min(IAM.members.length, 3)}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiAvatar-root': { width: "2rem", height: "2rem", fontSize: 15 },
                    }}
                    slotProps={{
                      additionalAvatar: {
                        sx: {
                          backgroundColor: alpha(theme.palette.background.paper, 0.25),
                          color: `var(--text-color)`
                        }
                      }
                    }}
                    onClick={() => {
                      setIsShareView(true);
                    }}
                  >
                    {IAM.members && IAM.members.map(x => (
                      <Avatar
                        sx={{
                          width: "2rem",
                          height: "2rem",
                          backgroundColor: x.theme_color || theme.palette.primary.main,
                          color: x.theme_color ? theme.palette.getContrastText(x.theme_color) : theme.palette.primary.contrastText,
                          border: `2px solid ${x.theme_color || theme.palette.primary.main}`,
                        }}

                        alt={x.name || ''}
                        src={x instanceof Group && x.integration ? getIntegrationIcon(x.integration) || '' : `${MEDIA_BASE_URI}/${x.getIconPath()}`}
                      >{x.integration === 'google' ? (
                        <Google fontSize="small" />
                      ) : (
                        x instanceof Event ? <CalendarMonthOutlined fontSize="small" /> : <GroupWorkOutlined fontSize="small" />
                      )}</Avatar>
                    ))}
                  </AvatarGroup>
                )
              }

              if (x === 'is_starred_by_profile' && ((IAM && IAM.members) && Session.session)) {

                const isFound = IAM.members.some(x => x.id() === Session.session!.id());

                return (
                  <IconButton>
                    {isFound ? <Star sx={{
                      color: "var(--text-color)"
                    }} /> : <StarOutline sx={{
                      color: "var(--text-color)"
                    }} />}
                  </IconButton>
                )
              }
            })}
          </div>
        </div>

        <div className="column compact left">
          {Modules.body && Modules.body.map((x: any) => {

            if (x === 'name') {
              return (
                <LargeTextField
                  label={`New ${item.type} Name`}
                  variant="standard"
                  inputRef={inputRef}
                  key="item_name"
                  name="name"
                  hiddenLabel
                  multiline
                  maxRows={4}
                  value={newItem && newItem.name}
                  spellCheck={false}
                  onChange={(e) => handleChange(e, e.target.value)}
                  placeholder={`${item.type} Name`}
                />
              )
            }

            if (x === 'dateTime') {
              return (
                <DateTimeAccordionModule
                  item={newItem}
                  handleChange={handleChange}
                  expanded={expanded === 'dateTime'}
                  onChange={() => handleAccordionChange('dateTime')}
                  handleMultiChange={handleMultiChange}
                  switchToSchedule={() => {
                    setIsSchedule(true);
                    setExpanded('scheduler');

                    if (!newItem.schedules || newItem.schedules.length === 0) {

                      const newSchedule = Schedule.createOffDrag(dayjs(String(item.date)), item.end_date ? dayjs(String(item.end_date)) : null, item.start_time ? new Chronos(Number(item.start_time)) : new Chronos(9), item.end_time ? new Chronos(Number(item.end_time)) : new Chronos(16));

                      startCreator(Type.Schedule, Mode.Create, newSchedule, {
                        // callback: (item: any) => handleSelection(item),
                        connected: true
                      })

                      setNewItem((prev) => {
                        if (!prev) {
                          return null;
                        }
                        return {
                          ...prev,
                          schedules: [newSchedule.eject()]
                        }
                      })
                    }
                  }}
                />
              )
            }

            if (x === 'username') {

              return (

                <SmallTextField
                  name="username"
                  variant="standard"
                  label="Username"
                  value={newItem.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onFocus={() => setExpanded("username")}
                />
              )
            }

            if (x === 'tagline') {

              return (

                <SmallTextField
                  name="tagline"
                  variant="standard"
                  label="Tagline"
                  value={newItem.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  onFocus={() => setExpanded("tagline")}
                />
              )
            }

          })}
        </div>
        <div className="column compact">

            {newItem.link && (
          <div className="column">
              <TextField
                name="link"
                variant="standard"
                label="Link"
                value={newItem.link || ""}
                onChange={(e) => handleChange("link", ensureHttpsPrefix(e.target.value))}
                onFocus={() => setExpanded("link")}
              />
          </div>
            )}
          <div className="flex between" style={{
            padding: "0.25rem 0.5rem"
          }}>
            <div className="flex compact fit" style={{
              position: "relative"
            }}>
            </div>
            <div className="flex compact fit">
              <IconButton
                style={{ position: "relative", height: "fit-content", color: "var(--text-color)" }}
                onClick={() => {
                  handleChange("link", newItem.link || "https://")
                }}>
                <LinkOutlined />
              </IconButton>
              <IconButton
                style={{ position: "relative", height: "fit-content", color: "var(--text-color)" }}
                onClick={() => {
                  handleMetadataChange("description", newItem.metadata.description || "Description")
                }}>
                <TextFieldsOutlined />
              </IconButton>
              <div className="flex snug fit">
                <Button
                  startIcon={<SaveOutlined />}
                  variant="flipped"
                  onClick={async () => {
                    try {
                      await save();
                      removePanel(item.uuid);
                    }
                    catch (err) {
                      return;
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );


  const ShareForm = (
    <>
      <div className="flex between" style={{
        padding: "1rem"
      }}>
        <div className="flex snug fit" style={{
          width: "40%"
        }}>
          <Button
            variant="text"
            onClick={() => {
              setIsShareView(false);
            }}
            startIcon={
              <ArrowBack fontSize="small" />
            }
            sx={{
              color: item && item.theme_color ? getContrastRatio(item.theme_color, theme.palette.background.paper) >= 4.5 ? item.theme_color : theme.palette.text.primary : theme.palette.text.primary,
            }}
          >
            Back
          </Button>
        </div>
        <div className="flex compact fit" >
          <Typography variant="h6">Sharing</Typography>
        </div>
        <div className="flex fit compact right" style={{
          width: "40%"
        }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: "0.85rem",
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `2px solid ${newItem.theme_color || theme.palette.primary.main}`,
              margin: "0.5rem 0.5rem 0.5rem 0"
            }}
            alt={newItem.name || ""}
            src={newItem.icon_img ? `${MEDIA_BASE_URI}/${newItem.icon_img.path}` : ''}
          >
            <CalendarMonthOutlined sx={{
              fontSize: '1rem'
            }} />
          </Avatar>
          <Typography sx={{
            fontSize: "0.875rem",
            lineHeight: "115%"
          }}>{newItem.name}</Typography>
        </div>
      </div>
      <div className="column snug">
        <TransitionGroup>
          <Collapse>
            <div className="column snug">
              {item && (
                <IAMAccordionModule
                  item={item}
                  Session={Session}
                  handleChange={handleChange}
                  expanded={true}
                  IAM={IAM}
                  Base={Base}
                  Parent={Parent}
                  source={source}
                  parent={parent}
                  onChange={(value) => handleChange("junctions", value)}
                />
              )}
            </div>
          </Collapse>
        </TransitionGroup>
      </div>
    </>
  )

  return {
    Form,
    ShareForm,
    save
  };
}



export const CreatePanel = memo((createProps: CreatePanelProps) => {

  const { Base, item, source, Session, startCreator, removePanel, Parent, parent, index } = createProps;
  const theme = Base.theme;

  const [isShareView, setIsShareView] = useState(false);
  const isMed = useMediaQuery(theme.breakpoints.down('md'));

  const [color, setColor] = useState(item.theme_color || theme.palette.primary.main);

  const handleShareViewChange = (newValue: boolean) => {
    // setTimeout(() => , 600);
    setIsShareView(newValue)
  }

  const tempTheme: Theme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        ...theme.palette.primary,
        main: item && color ? color : theme.palette.text.primary,
        light: item && color ? lighten(color, 0.9) : theme.palette.primary.light,
        dark: item && color ? darken(color, 0.1) : theme.palette.primary.dark,
        contrastText: item && color ? theme.palette.getContrastText(color) : theme.palette.getContrastText(theme.palette.text.primary)
      },
    },
    components: {
      ...theme.components,
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'capitalize',
            variants: [
              {
                props: { variant: "flipped" },
                style: {
                  '&:hover': {
                    backgroundColor: item && color ? darken(theme.palette.getContrastText(color), 0.1) : "unset",
                  },
                  backgroundColor: item && color ? theme.palette.getContrastText(color) : theme.palette.primary.contrastText,
                  color: item && color || theme.palette.primary.main,
                }
              },
              {
                props: { variant: "outlined_flipped" },
                style: {
                  border: "1px solid !important",
                  borderColor: item && color ? theme.palette.getContrastText(color) : theme.palette.primary.contrastText,
                  color: item && color ? theme.palette.getContrastText(color) : theme.palette.primary.contrastText,
                }
              },
            ]
          }
        },
      }
    }
  })

  const editor: UseCreateForm = useCreatePanel(item, source, Base, Session, startCreator, removePanel, handleShareViewChange, setColor, Parent, parent);

  return (
    <ThemeProvider theme={tempTheme}>
      <Paper
        style={{
          ...(isMed ? CreatorPanelMobileStyles : CreatorPanelStyles),
          transform: isShareView ? 'rotateY(180deg)' : 'rotateY(0deg)',
          ...SharedCreatorPanelStyles,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s',
          zIndex: index,
        }}
      >
        <div >
          <div className="column snug" style={{
            display: isShareView ? 'flex' : 'none',
            opacity: isShareView ? 1 : 0,
            transform: "rotateY(180deg)",
            // animation: "fadeIn 0.4s ease-in-out forwards"
          }}>{editor.ShareForm}</div>

          <div className="column snug" style={{
            display: !isShareView ? 'flex' : 'none',
            opacity: !isShareView ? 1 : 0,
            // animation: "fadeInAndFlip 0.3s ease-in-out forwards",
          }}>
            {editor.Form}
          </div>

        </div>
      </Paper >
    </ThemeProvider >
  )
});

CreatePanel.displayName = 'CreatePanel';