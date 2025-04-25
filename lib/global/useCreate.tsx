'use client';
import {
  Modal,
  Collapse,
  ThemeProvider,
  Slide
} from '@mui/material';
import React, { useState, useMemo, useCallback, CSSProperties, JSX } from 'react';
import { UseBaseCore } from './useBase';
import { Type, Mode } from '@/types/globals';
import { Member, MemberFactory, Schedule } from "@/schema";
import { TransitionGroup } from 'react-transition-group';
import { useSnackbar } from 'notistack';
import { UseSession } from './useSession';
import { CreatePanel } from '../useCreatePanel';

export const CreatorModules : Record<Type, any> = {
  [Type.Event]: {
    title: "Create Event",
    description: "Enter a name, date and time, schedule, and creative additions.",
    header: [
      "media",
      "share",
      "theme_color",
      "is_starred_by_profile"
    ],
    body: [
      "name",
      "dateTime",
    ],
    footer: [
      "description",
      "link"
    ]
  },
  [Type.Group]: {
    title: "Create Group",
    description: "Enter a name for your group",
    header: [
      "media",
      "theme_color"
    ],
    body: [
      "name",
      "username",
      "tagline"
    ],
    footer: []
  },
  [Type.Merchant]: {},
  [Type.Location]: {},
  [Type.Profile]: undefined,
  [Type.Reservation]: undefined,
  [Type.Certificate]: undefined,
  [Type.Schedule]: undefined
}

export interface CreatePanelProps {
  item: any;
  source: Member;
  Base: UseBaseCore;
  Session: UseSession,
  Parent?: UseBaseCore;
  removePanel: (uuid: string) => void;
  [key: string]: any;
}

export interface CreatorPanelProps {
  type: Type,
  mode: Mode,
  callback?: (item: any | any[]) => any
}

export interface UseCreateForm {
  Form: JSX.Element;
  ShareForm?: JSX.Element;
  save: (copy?: boolean) => Promise<void>;
}

export interface CreatorPanel {
  uuid: string,
  type: Type,
  mode: Mode,
  callback?: (item: any) => any,
  onQuit?: () => any,
  [key: string]: any
}


export type StartCreator = (type: Type, mode: Mode, item?: Member | Schedule | null, props?: any) => void;

export interface UseCreator {
  isOpen: boolean;
  CreateForm: JSX.Element,
  startCreator: StartCreator;
}

export default function useCreator(source: Member | null, Base: UseBaseCore, Session: UseSession, Parent?: UseBaseCore, parent?: Member | null): UseCreator {

  const theme = Base.theme;
  const [isOpen, setIsOpen] = useState(false);
  const [panels, setPanels] = useState<CreatorPanel[]>([]);


  const { enqueueSnackbar } = useSnackbar();

  const toggleDrawer = useCallback((open: boolean): void => {
    setIsOpen(open);
  }, []);

  const removePanel = useCallback((id: string): void => {
    console.log({
      id, panels
    })
    setPanels(prev => {
      const newPanel = prev.filter((item) => item.uuid != id);
      if (newPanel.length === 0) toggleDrawer(false);
      return newPanel;
    });
  }, [panels, toggleDrawer]);

  const addPanel = useCallback((newPanel: CreatorPanel) => {
    setPanels(prev => [...prev, newPanel]);
    return;
  }, []);


  const handleDelete = useCallback((type: Type, mode: Mode, props: any = {}) => {
    if (!props.items || !source) {
      throw Error("Must provide items in props.")
    }
    MemberFactory.delete(source, props.items, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);



  const startCreator = useCallback(async (type: Type, mode: Mode, item: Member | null = null, props: any = {}) => {
    
    let key = null;
    if (!source) {
      console.log("No source");
      return;
    }

    if (!item) {
      item = MemberFactory.create(type, {
        theme_color: source ? source.theme_color : parent ? parent.theme_color : theme.palette.primary.main
      })
    }

    switch (mode) {
      case Mode.Copy:

        if (!item) {
          console.log("Nothing to copy.")
          return false;
        }
        const theCopy = item.copy(false, false, true);
        Base.add(type, theCopy);
        return true;

      case Mode.Delete:
        if (props.callback) {
          props.callback();
        }

        if (item.type === Type.Event) {
          return Base.Events.remove(props.items)
        }
        return handleDelete(type, mode, props);

      case Mode.Create:
        key = true;
        if (source) item.junctions.set(source.id(), MemberFactory.connect(source, item));
        if (parent) item.junctions.set(parent.id(), MemberFactory.connect(parent, item));
        if ((!source && !parent) && Session.session) {
          item.junctions.set(Session.session.id(), MemberFactory.connect(Session.session, item))
        }

      case Mode.Modify:
        key = await MemberFactory.acquire(item, source)
          .then(res => {
            return true;
          })
          .catch(err => {
            console.log(err);
            enqueueSnackbar("Something went wrong.", {
              variant: "error"
            })
            return false;
          })
    }

    const ejected = item.eject ? item.eject() : item;

    const panel = {
      ...props,
      ...ejected,
      key,
      type: type,
      mode: mode,
      token: MemberFactory.getToken(item),
      // metadata: item.metadata || {},
      callback: props.callback || null,
    }

    toggleDrawer(true);
    addPanel(panel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addPanel, removePanel, toggleDrawer, Base, source, parent]);


  const doesPanelExist = (uuid: string): boolean => {
    return panels.some(panel => panel.uuid === uuid);
  }

  const clear = () => {
    for (const panel of panels) {
      if (panel.onQuit) {
        panel.onQuit();
      }
    }
    setPanels([]);
  }

  const CreateNewForm = useMemo(() => {

    if (!source) {
      console.log("No source");
      return null;
    }
    
    return panels.map((item, index: number) => {
      const key = `${item.type}-${item.mode}-${item.uuid}`;
      console.log(key);
      return (
        <Collapse key={key}>
          <CreatePanel
            item={item}
            source={source}
            Base={Base}
            Parent={Parent}
            Session={Session}
            removePanel={removePanel}
            doesPanelExist={doesPanelExist}
            index={index}
            startCreator={startCreator}
            parent={parent}
          />
        </Collapse>
      );
    }).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels]);

  const CreateForm = (
    <ThemeProvider theme={theme}>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={isOpen}
        onClose={() => {
          console.log("Case D");
          setIsOpen(false);
          clear();
        }}
        keepMounted
        sx={{ zIndex: 10 }}
      >
        <div
          className='flex snug'
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              console.log("Case C");
              setIsOpen(false);
              clear();
            }
          }}
          style={{ height: '100vh', width: '100vw' }}
        >
          <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
            <div
              className="flex compact top center"
              onClick={(e) => {
                if (e.currentTarget === e.target) {
                  console.log("Case B");
                  setIsOpen(false);
                  clear();
                }
              }}
            >
              <TransitionGroup
                onClick={(e) => {
                  if (e.currentTarget === e.target) {
                    console.log("Case A");
                    setIsOpen(false);
                    clear();
                  }
                }}
                className="flex compact"
                style={{
                  position: "relative",
                  alignItems: 'center',
                  width: "100vw",
                  height: "100vh",
                  justifyContent: 'center',
                }}
              >
                {CreateNewForm}
              </TransitionGroup>
            </div>
          </Slide>
        </div>
      </Modal>
    </ThemeProvider>
  );

  return { isOpen, CreateForm, startCreator };
}


export const SharedCreatorPanelStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: 'fit-content',
  // overflowX: 'hidden',
  // overflowY: 'hidden',
  // transition: '0.5s ease-in-out left, 0.5s ease-in-out top, 0.5s ease-in-out transform',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.4s'
}

export const CreatorPanelStyles: CSSProperties = {
  top: '50vh',
  left: "50vw",
  width: '40rem',
  maxWidth: "100vw",
  maxHeight: '100vh',
  borderRadius: '0.5rem',
}

export const CreatorPanelMobileStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  minHeight: '100vh',
  borderRadius: 0,
}