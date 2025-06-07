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
  MenuItem,
  ButtonBase,
  CircularProgress,
  Popover,
} from "@mui/material";
import React, { useState, useEffect, useRef, useCallback, memo, ChangeEvent, Fragment } from "react";
import { EventData, ImageDisplayType, Junction, JunctionBuilder, Event, Member, MemberData, MemberFactory, Schedule, JunctionData } from "@/schema";
import { AddOutlined, ArrowBack, CalendarMonthOutlined, ChangeHistoryOutlined, CloseOutlined, EditCalendar, FirstPage, FirstPageOutlined, LastPageOutlined, LinkOutlined, MarkunreadMailboxOutlined, PhotoLibraryOutlined, SaveOutlined, SendOutlined, TextFieldsOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { CreatePanelProps, CreatorModules, CreatorPanelMobileStyles, CreatorPanelProps, CreatorPanelStyles, SharedCreatorPanelStyles, StartCreator, UseCreateForm } from "./global/useCreate";
import { TransitionGroup } from 'react-transition-group';
import { UseSession, UseSession_SessionOnly } from "./global/useSession";
import { Mode, Type } from "@/types/globals";
import Chronos from "./utils/chronos";
import dayjs from "dayjs";
import axios, { API } from "./utils/axios";
import { UseBaseCore } from "./global/useBase";
import useComplexFileDrop, { MEDIA_BASE_URI, UploadType } from "./useComplexFileDrop";
import ColorPaletteSelector from "@/components/accordions/ColorPaletteSelector";
import DateTimeAccordionModule from "@/components/accordions/DateTimeAccordionModule";
import LargeTextField from "@/components/LargeTextField";
import SmallTextField from "@/components/SmallTextField";
import StyledIconButton from "@/components/StyledIconButton";
import ItemStub from "@/components/ItemStub";
import CodeMirrorEditor from "@/components/CodeMirrorEditor";
import MultipleSelectChip from "@/components/MultipleChipSelect";
import ResolveItemIcon from "@/components/ResolveItemIcon";
import { useTimeout } from "@mui/x-data-grid/internals";
import Divider from "@/components/Divider";
import JotformFormModule from "@/components/accordions/JotformFormModule";
import { IntegrationTemplates } from "@/pages/me/integrations";


const ensureHttpsPrefix = (value: string): `https://${string}` => {
  // Remove any leading `#` and add exactly one
  return `https://${value.replace(/^https?:\/\//, '')}`;
};


export default function useCreatePanel(
  item: MemberData & CreatorPanelProps,
  source: Member,
  Base: UseBaseCore,
  startCreator: StartCreator,
  removePanel: (id: string) => void,
  setIsShareView: (value: boolean) => any,
  setColor: any,
  Session?: UseSession_SessionOnly,
  Parent?: UseBaseCore,
  parent?: Member,

): UseCreateForm {

  const inputRef = useRef<any>(null);

  const { theme, Events, Locations, ...OtherBase } = Base;
  const Modules = CreatorModules[item.type as Type];

  const [progress, setProgress] = useState('editing');
  const [newItem, setNewItem] = useState<(MemberData & CreatorPanelProps) | null>(item || null);
  const [expanded, setExpanded] = useState('dateTime');
  const [searchResults, setSearchResults] = useState<Member[] | null>(null);

  const [junctions, setJunctions] = useState<Member[]>([]);
  const [locations, setLocations] = useState<Member[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [actionBank, setActionBank] = useState([]);
  const [variables, setVariables] = useState([]);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isJunctionPopoverOpen = Boolean(anchorEl);

  const [uploads, setUploads] = useState<UploadType[]>([]);
  const { FileUpload, FilePreview, handleUpload, openDialog, isUploadPresent, isFileUploadOpen, uploadCount } = useComplexFileDrop(MemberFactory.collect_media(item), uploads, setUploads);

  useEffect(() => {
    console.log(inputRef);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const registerActions = (values: any[]) => {

    setActions(prev => ([...prev, ...values]))
  }


  const registerJunction = (value: any) => {


    if (value.integration && item.integration) {

      const integration = IntegrationTemplates.find(x => x.slug === value.integration);

      if (integration && integration.types) {
        const key = item.integration as keyof typeof integration.types;
        const types = integration.types[key] ?? null;

        if (types) {
          const events = types['events'];

          if (events) {
            registerActions(events.map((x: any) => ({
              integration: value.integration,
              source: value.id(),
              template: {},
              status: 'action_required',
              ...x,
            })));
          }
        }
      }
    }

    setJunctions(prev => {
      return [...prev, value];
    });

  }


  const registerExistingJunction = (value: MemberData) => {


    const pendingActions = [];
    for (const j of value.junctions) {
      const junction: Junction = j;


      if ((junction as any).external_child_events) {
        for (const event of Object.values((junction as any).external_child_events)) {
          console.log(event);
          pendingActions.push(event);
        }
      }
    }

    const built = MemberFactory.create(value.type, value);
    if (built instanceof Event) {
      built.localize();
    }

    registerActions(pendingActions);

    setJunctions(prev => {
      return [...prev, built];
    });
  }

  const updateAction = (value: any) => {
    setActions(prev => {
      const copy = [...prev];
      const filtered = prev.filter(x => x.slug != value.slug)
      return [...filtered, value];
    })
  }

  const unregisterJunction = (value: Member) => {

    setJunctions(prev => {

      const copy = [...prev];
      const filtered = prev.filter(x => x.uuid != value.uuid);

      /**
       * TODO
       * - Remove action associated with the junction.
       */

      return filtered;
    })
  }


  useEffect(() => {

    if (item.doNotPrepJunctions) {
      return;
    }


    if (item.integration === '#jotform.form') {
      axios.get(`/api/v1/auth/jotform/actions`, {
        params: {
          uuid: source.id(),
          source: MemberFactory.getToken(source),
          form_id: item.local_id,
          action: 'getSubmissionVariables'
        }
      })
        .then(res => {
          setVariables(res.data.variables)
        })
        .catch(err => {
          console.log(err);
        })
    }

    try {

      if (item.mode === Mode.Create) {


        const startJunction = new JunctionBuilder()
          .from(Junction.toPointer(source)).to({
            type: item.type,
            value: item.uuid
          })
          .allowAll()
          .isPrivate()
          .fromChildToParent()
          .denyAll()

        if (item.integration) {
          startJunction
            .fromParentToChild()
            .designate({
              id: item.local_id,
              type: item.integration
            })
        };

        const copy = source.copy();
        copy.junctions.set(source.id(), startJunction.build('hosts')[0]);

        registerJunction(copy);
      }
      else if (item.mode === Mode.Modify) {

        console.log(item);

        axios.get(API.GET_IAM, {
          params: {
            source: MemberFactory.getToken(item),
          }
        })
          .then(res => {
            for (const member of res.data.members as MemberData[]) {
              registerExistingJunction(member);
            }
          })

        return;

      }

    }
    catch (err) {
      console.log(err);
    }

    return () => {

      if (item.mode != Mode.Modify) {
        return;
      }

      axios.delete(API.RELINQUISH_ITEM, {
        params: {
          type: item.type,
          uuid: item.uuid
        }
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
          item.callback = (i: any, s: any, a: any) => Base.add(item.type, i, s, a);
        }
        else if (item.mode === Mode.Modify) {
          item.callback = (i: any, s: any, a: any) => Base.update(item.type, i, s, a);
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

      if (copyOfEvent) {
        copyOfEvent.junctions = null;
      }

      if (copyOfEvent.variables) {
        delete copyOfEvent.variables
      }

      if (copyOfEvent.token) {
        delete copyOfEvent.token;
      }

      await item.callback(copyOfEvent, junctions.map(x => x.eject()), actions);
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
        '--text-color': theme.palette.text.primary,
        '--bg-color': theme.palette.background.paper,
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        borderRadius: '0.5rem',
        height: "100%",
        overflowY: 'scroll'
      }}
    >

      {uploadCount > 0 && (
        <div className="column" style={{
          padding: "1rem"
        }}>
          {FilePreview}
        </div>
      )}

      {FileUpload}

      <div className="column" style={{
        padding: "1rem",
      }}>

        <Typography id="modal-title" variant="h2" className="visually-hidden">Create New Event</Typography>
        <Typography id="modal-description" className="visually-hidden">Enter a name, date and time, schedule, and creative additions.</Typography>

        <div className="flex between">

          <div className="flex compact fit">


            {Modules && Modules.header && Modules.header.map((x: any) => {

              if (x === 'media') {
                return (
                  <IconButton key={x} onClick={() => openDialog()} style={{ position: "relative", height: "fit-content" }}>
                    <PhotoLibraryOutlined sx={{
                      color: "var(--text-color)"
                    }} />
                  </IconButton>
                )
              }

              if (x === 'theme_color') {
                return (
                  <ColorPaletteSelector
                    key={x}
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

          <div className="flex snug fit">
            {Modules && Modules.header && Modules.header.map((x: any) => {

              // if (x === 'is_starred_by_profile' && ((IAM && IAM.members) && Session.session)) {

              //   const isFound = IAM.members.some(x => x.id() === Session.session!.id());

              //   return (
              //     <IconButton>
              //       {isFound ? <Star sx={{
              //         color: "var(--text-color)"
              //       }} /> : <StarOutline sx={{
              //         color: "var(--text-color)"
              //       }} />}
              //     </IconButton>
              //   )
              // }
            })}

            <div style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem"
            }}>
              <StyledIconButton
                title="Close"
                onClick={() => {
                  removePanel(item.uuid);
                }}
              >
                <CloseOutlined sx={{
                  fontSize: '1rem'
                }} />
              </StyledIconButton>
            </div>
          </div>
        </div>

        <div className="column compact left">
          {Modules && Modules.body && Modules.body.map((x: any) => {

            if (x === 'name') {

              if (item.variables) {

                return (
                  <CodeMirrorEditor
                    placeholder={`New ${item.type} Name`}
                    variables={item.variables}
                    initialValue={item.name}
                    key={`${x}_with_vars`}
                    onChange={text => {
                      handleChange('name', text)
                    }}
                  />
                )
              }
              return (
                <LargeTextField
                  label={`New ${item.type} Name`}
                  variant="standard"
                  inputRef={inputRef}
                  key={x}
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
                  variables={item.variables}
                  key={x}
                  item={newItem}
                  handleChange={handleChange}
                  expanded={expanded === 'dateTime'}
                  onChange={() => handleAccordionChange('dateTime')}
                  handleMultiChange={handleMultiChange}
                  switchToSchedule={() => {
                    setExpanded('scheduler');

                    if (!newItem.schedules || newItem.schedules.length === 0) {

                      const newSchedule = Schedule.createOffDrag(dayjs(String(item.date)), item.end_date ? dayjs(String(item.end_date)) : null, item.start_time ? new Chronos(Number(item.start_time)) : new Chronos(9), item.end_time ? new Chronos(Number(item.end_time)) : new Chronos(16));
                      // startCreator(Type.Schedule, Mode.Create, newSchedule, {
                      //   // callback: (item: any) => handleSelection(item),
                      //   connected: true
                      // })

                      setNewItem((prev: any) => {
                        if (!prev) {
                          return null;
                        }
                        return {
                          ...prev,
                          schedules: [newSchedule.eject()],
                          date: null,
                          start_time: null,
                          end_date: null,
                          end_time: null
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
                  key={x}
                  name="username"
                  variant="standard"
                  label="Username"
                  value={newItem.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onFocus={() => setExpanded("username")}
                />
              )
            }

            if (x === 'apiKey') {

              return (

                <div className="column compact" key={x}>
                  <Typography variant="h5">Connect to Jotform</Typography>
                  <SmallTextField
                    name="apiKey"
                    variant="standard"
                    label="API Key"
                    value={newItem.apiKey || ""}
                    onChange={(e) => handleChange("apiKey", e.target.value)}
                    onFocus={() => setExpanded("apiKey")}
                  />
                </div>
              )
            }

            if (x === 'share' && Session && !item.variables) {
              return (
                <div className="column compact" key={x}>
                  <Popover
                    anchorEl={anchorEl}
                    open={isJunctionPopoverOpen}
                    // placement='left-start'
                    onClose={(e: any) => {
                      e.stopPropagation();
                      setAnchorEl(null)
                    }}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <Typography>Test</Typography>
                  </Popover>
                  <MultipleSelectChip
                    label="Share"
                    onClick={(item: Member) => {
                      console.log(item);
                      return;
                    }}
                    onChange={(e: any) => {
                      const query = e.target.value;
                      const bases = Session.search(query);
                      const theEvents = Session.Events.search(query);
                      const eventsFromBase = Base ? Base.Events.search(query) : [];
                      console.log({
                        bases,
                        theEvents,
                        eventsFromBase
                      })

                      const combined = [...bases, ...theEvents, ...eventsFromBase];
                      const deduped = Array.from(
                        new Map(combined.map(item => [item.id, item])).values()
                      );
                      return deduped;
                    }}
                    selected={junctions}
                    setSelected={setJunctions}
                    initialRecommendations={
                      <div className="column snug">
                        {Session.session && !junctions.some(j => j.id() === Session.session!.id()) && (
                          <ButtonBase
                            disableRipple
                            onClick={() => {

                              if (!Session.session) {
                                return;
                              }

                              setJunctions((prev: any) => {
                                const copy = prev;
                                const filtered = copy.filter((x: any) => x.id() != Session.session!.id());
                                filtered.push(Session.session);
                                return filtered;
                              })
                            }}
                            className="flex compact left"
                            sx={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.25rem"
                            }}
                          >
                            <Avatar sx={{
                              width: "2rem",
                              height: "2rem",
                              backgroundColor: Session.session.theme_color
                            }} src={('icon_img' in Session.session && Session.session.icon_img) ? `${MEDIA_BASE_URI}/${Session.session.icon_img.path}` : undefined}>
                              <ResolveItemIcon
                                item={Session.session}
                                sx={{
                                  fontSize: "1rem",
                                  color: Session.session.theme_color ? theme.palette.getContrastText(Session.session.theme_color) : theme.palette.text.primary
                                }}
                              />
                            </Avatar>
                            <Typography>Share with me.</Typography>
                          </ButtonBase>
                        )}
                      </div>
                    }
                  />
                </div>
              )
            }

            if (x === 'location' && Session) {
              return (
                <div className="column compact" key={x}>

                  <MultipleSelectChip
                    onClick={(item: Member) => {
                      console.log(item);
                      return;
                    }}
                    label="Locations"
                    onChange={(e: any) => {
                      const query = e.target.value;
                      const bases = Session.search(query);
                      const theEvents = Session.Events.search(query);
                      const eventsFromBase = Base ? Base.Events.search(query) : [];
                      console.log({
                        bases,
                        theEvents,
                        eventsFromBase
                      })

                      const combined = [...bases, ...theEvents, ...eventsFromBase];
                      const deduped = Array.from(
                        new Map(combined.map(item => [item.id, item])).values()
                      );
                      return deduped;
                    }}
                    selected={locations}
                    setSelected={setLocations}
                    initialRecommendations={
                      <div className="column snug">
                        {Session.session && !junctions.some(j => j.id() === Session.session!.id()) && (
                          <div className="column snug">
                            <Typography>No results.</Typography>
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              )
            }

            if (x === 'actions' && Session && !item.variables) {
              return (
                <div className="column compact" key={x}>

                  <MultipleSelectChip
                    getId={(item) => item.slug}
                    onClick={(item: any) => {
                      console.log(item);
                      startCreator(item.result, item.status === 'action_required' ? Mode.Create : Mode.Modify, new Event(item.template), {
                        callback: (x) => {
                          console.log(x);
                          updateAction({
                            ...item,
                            template: x,
                            status: 'completed'
                          })
                          return;
                        },
                        variables: variables ? variables.map((x: any) => ({
                          label: x.text,
                          slug: x.name,
                          isCanBeNull: true
                        })) : [],
                        doNotPrepJunctions: true
                      })
                      return;
                    }}
                    label="Actions"
                    onChange={(e: any) => {
                      const query = e.target.value;
                      const bases = Session.search(query);
                      const theEvents = Session.Events.search(query);
                      const eventsFromBase = Base ? Base.Events.search(query) : [];

                      return [...bases, ...theEvents, ...eventsFromBase];
                    }}
                    selected={actions}
                    setSelected={setActions}
                    initialRecommendations={
                      <div className="column snug">
                        {Session.session && !junctions.some(j => j.id() === Session.session!.id()) && (
                          <div className="column snug">
                            <div className="column snug" style={{
                              padding: '0.5rem 0.25rem'
                            }}>
                              <ButtonBase
                                disableRipple
                                onClick={() => {
                                  return;
                                }}
                                className="flex compact left"
                                sx={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem"
                                }}
                              >
                                <Avatar sx={{
                                  width: "1.75rem",
                                  height: "1.75rem",
                                  border: `1px dashed ${theme.palette.primary.main}`,
                                  backgroundColor: theme.palette.background.paper
                                }}>
                                  <FirstPageOutlined sx={{
                                    fontSize: "1rem",
                                    color: theme.palette.primary.main
                                  }} />
                                </Avatar>
                                <div className="column snug left">
                                  <Typography sx={{
                                    fontSize: "1rem"
                                  }}>On Event Starts</Typography>
                                </div>
                              </ButtonBase>
                              <ButtonBase
                                disableRipple
                                onClick={() => {
                                  return;
                                }}
                                className="flex compact left"
                                sx={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem"
                                }}
                              >
                                <Avatar sx={{
                                  width: "1.75rem",
                                  height: "1.75rem",
                                  border: `1px dashed ${theme.palette.primary.main}`,
                                  backgroundColor: theme.palette.background.paper
                                }}>
                                  <LastPageOutlined sx={{
                                    fontSize: "1rem",
                                    color: theme.palette.primary.main
                                  }} />
                                </Avatar>
                                <div className="column snug left">
                                  <Typography sx={{
                                    fontSize: "1rem"
                                  }}>On Event Ends</Typography>
                                </div>
                              </ButtonBase>
                              <ButtonBase
                                disableRipple
                                onClick={() => {
                                  return;
                                }}
                                className="flex compact left"
                                sx={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem"
                                }}
                              >
                                <Avatar sx={{
                                  width: "1.75rem",
                                  height: "1.75rem",
                                  border: `1px dashed ${theme.palette.primary.main}`,
                                  backgroundColor: theme.palette.background.paper
                                }}>
                                  <ChangeHistoryOutlined sx={{
                                    fontSize: "1rem",
                                    color: theme.palette.primary.main
                                  }} />
                                </Avatar>
                                <div className="column snug left">
                                  <Typography sx={{
                                    fontSize: "1rem"
                                  }}>On Updated</Typography>
                                </div>
                              </ButtonBase>
                            </div>
                            <Divider />
                            <div className="column snug" style={{
                              padding: '0.5rem 0.25rem'
                            }}>
                              <ButtonBase
                                disableRipple
                                onClick={() => {
                                  return;
                                }}
                                className="flex compact left"
                                sx={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem"
                                }}
                              >
                                <Avatar sx={{
                                  width: "1.75rem",
                                  height: "1.75rem",
                                  border: `1px dashed ${theme.palette.primary.main}`,
                                  backgroundColor: theme.palette.background.paper
                                }}>
                                  <MarkunreadMailboxOutlined sx={{
                                    fontSize: "0.875rem",
                                    color: theme.palette.primary.main
                                  }} />
                                </Avatar>
                                <div className="column snug left">
                                  <Typography sx={{
                                    fontSize: "1rem"
                                  }}>On a Submission</Typography>
                                </div>
                              </ButtonBase>
                            </div>
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              )
            }


            if (x === 'tagline') {

              return (

                <SmallTextField
                  key={x}
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

        {newItem.link && (
          <div className="column" key={'link'}>
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
        <div className="column compact" style={{
          position: 'sticky',
          bottom: "0"
        }}>
          <div className="flex right" style={{
            padding: "0.25rem 0.5rem",
          }}>
            <div className="flex compact fit" style={{
            }}>
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
                  disabled={actions.some(x => x.status === 'action_required')}
                  endIcon={progress === 'editing' ? item.mode === Mode.Create ? <SendOutlined /> : item.mode === Mode.Modify ? item.type === Type.Event ? <EditCalendar /> : <SaveOutlined /> : <SaveOutlined /> : ''}
                  variant="contained"
                  onClick={async () => {
                    try {
                      setProgress('saving');
                      await save();
                      setTimeout(async () => {
                        removePanel(item.uuid);
                      }, 500)
                    }
                    catch (err) {
                      setProgress('editing')
                      return;
                    }
                  }}
                >
                  {progress === 'editing' ? (
                    <Fragment key={progress}>{item.mode === Mode.Create ? `New ${item.type.toString()}` : 'Save'}</Fragment>
                  ) : (
                    <Fragment key={progress}><CircularProgress size={16} sx={{
                      color: theme.palette.primary.contrastText
                    }} /></Fragment>
                  )}
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
              {/* {item && item.type != Type.Custom && (
                <IAMAccordionModule
                  item={item}
                  Session={Session}
                  handleChange={handleChange}
                  expanded={true}
                  Base={Base}
                  Parent={Parent}
                  source={source}
                  parent={parent}
                  onChange={(value) => handleChange("junctions", value)}
                />
              )} */}
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

  const editor: UseCreateForm = useCreatePanel(item, source, Base, startCreator, removePanel, handleShareViewChange, setColor, Session, Parent, parent);

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
        <div className="column snug" style={{
          display: !isShareView ? 'flex' : 'none',
          opacity: !isShareView ? 1 : 0,
          height: "100%"
          // animation: "fadeInAndFlip 0.3s ease-in-out forwards",
        }}>
          {editor.Form}
        </div>
      </Paper >
    </ThemeProvider >
  )
});

CreatePanel.displayName = 'CreatePanel';