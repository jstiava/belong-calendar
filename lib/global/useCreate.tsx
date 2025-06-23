'use client';
import {
  Modal,
  Collapse,
  ThemeProvider,
  Slide,
  useMediaQuery
} from '@mui/material';
import React, { useState, useMemo, useCallback, CSSProperties, JSX } from 'react';
import { UseBaseCore } from './useBase';
import { Member, MemberFactory, Mode, Schedule, Type, typeToDirectionality } from '@jstiava/chronos';
import { TransitionGroup } from 'react-transition-group';
import { useSnackbar } from 'notistack';
import { UseSession, UseSession_SessionOnly } from './useSession';
import { CreatePanel } from '../useCreatePanel';

export const CreatorModules: Record<Type | string, any> = {
  [Type.Event]: {
    title: "Create Event",
    description: "Enter a name, date and time, schedule, and creative additions.",
    header: [
      "media",
      "theme_color",
      "is_starred_by_profile"
    ],
    body: [
      "name",
      "dateTime",
      "location",
      "share",
      "actions"
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
  [Type.Location]: {},
  [Type.Profile]: {
    title: "Create Profile",
    description: "Enter a name for your profile",
    header: [
      "theme_color"
    ],
    body: [
      "name",
      "username",
      "email",
      "phone"
    ],
    footer: []
  },
  [Type.Custom]: {
    title: "Create Integration",
    body: [
      "apiKey",
    ],
  },
  '#jotform.form': {
    title: "Integrate a Jotform",
    description: "Track submissions and create actions.",
    header: [],
    body: [],
    footer: []
  },
  [Type.Schedule]: undefined,
}

export interface CreatePanelProps {
  item: any;
  source: Member;
  Base: UseBaseCore;
  Session?: UseSession_SessionOnly,
  Parent?: UseBaseCore;
  removePanel: (uuid: string) => void;
  [key: string]: any;
}

export interface CreatorPanelProps {
  type: Type,
  mode: Mode,
  callback?: (item: any, sharing?: any[], actions?: any[]) => any
}

export interface UseCreateForm {
  Form: JSX.Element;
  ShareForm?: JSX.Element;
  save: (copy?: boolean) => Promise<void>;
}

export interface CreatorPanel {
  uuid?: string,
  type: Type,
  mode: Mode,
  callback?: any,
  onQuit?: () => any,
  [key: string]: any
}

type StartCreatorProps = {
  callback?: (item: any, sharing?: any[], actions?: any[]) => any
  doNotPrepJunctions?: boolean;
  isRightClick?: boolean;
  variables?: any[];
  [key: string]: any;
};


export type StartCreator = (type: Type, mode: Mode, item?: Member | Schedule | null, props?: StartCreatorProps) => void;

export interface UseCreator {
  isOpen: boolean;
  CreateForm: JSX.Element,
  startCreator: StartCreator;
}

export default function useCreator(
  source: Member | null,
  Base: UseBaseCore,
  Session?: UseSession_SessionOnly,
  Parent?: UseBaseCore,
  parent?: Member | null
): UseCreator {

  const theme = Base.theme;
  const isMed = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(false);
  const [panels, setPanels] = useState<CreatorPanel[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const toggleDrawer = useCallback((open: boolean): void => {
    setIsOpen(open);
  }, []);

  const removePanel = useCallback((id: string): void => {

    setPanels((prev) => {
      const updated = prev.filter((x) => x.uuid !== id);
      if (updated.length === 0) {
        toggleDrawer(false);
      }
      return updated;
    });


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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



  const startCreator = useCallback(
    async (type: Type, mode: Mode, item: Member | null = null, props: StartCreatorProps = {}) => {

      let key = null;
      if (!source) {
        console.log("No source");
        return;
      }

      if (!item) {

        if (type === Type.Custom) {
          const panel = {
            ...props,
            key,
            type: type,
            mode: mode,
            // metadata: item.metadata || {},
            callback: props.callback || null,
          }

          toggleDrawer(true);
          addPanel(panel);

          return;
        };

        item = MemberFactory.create(type, {
          theme_color: source ? source.theme_color : parent ? parent.theme_color : theme.palette.primary.main
        })
      }
      else {
        item.theme_color = item.theme_color ? item.theme_color : source ? source.theme_color : parent ? parent.theme_color : theme.palette.primary.main;
      }

      switch (mode) {
        case Mode.Copy:

          if (!item) {
            console.log("Nothing to copy.")
            return false;
          }
          const theCopy = item.copy(false, false, true);
          Base.add(type, theCopy.eject());
          return true;

        case Mode.Delete:
          if (props.callback) {
            props.callback(item);
          }

          if (item.type === Type.Event) {
            return Base.Events.remove(props.items)
          }
          return handleDelete(type, mode, props);

        case Mode.Create:
          key = true;
          if (!props.doNotPrepJunctions) {

            if (source) item.junctions.set(`${source.id()}_${typeToDirectionality(item.type, source.type === Type.Event)}`, MemberFactory.connect(source, item));
            if (parent) item.junctions.set(`${source.id()}_${typeToDirectionality(item.type, source.type === Type.Event)}`, MemberFactory.connect(parent, item));
            if (Session && ((!source && !parent) && Session.session)) {
              item.junctions.set(Session.session.id(), MemberFactory.connect(Session.session, item))
            }
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

    console.log(panels);

    return (
      <>
        {panels.map((item, index: number) => {
          const key = `${item.type}-${item.mode}-${item.uuid}-${index}`;
          return (
            <CreatePanel
              key={key}
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
          );
        }).filter(Boolean)}
      </>
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels]);

  const CreateForm = (
    <ThemeProvider theme={theme} key={`${source?.id()}-CreateForm`}>
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
                className="column compact right bottom"
                style={{
                  position: "relative",
                  width: "100vw",
                  height: "100vh",
                  padding: isMed ? "0rem" : '1rem'
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
  bottom: "1rem",
  right: "1rem",
  width: '35rem',
  maxWidth: "100vw",
  maxHeight: '95vh',
  borderRadius: '0.5rem',
  // position: 'absolute'
}

export const CreatorPanelMobileStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  minHeight: '100vh',
  borderRadius: 0,
}





/**
 *  state: JSON.stringify({
                        integration: 'strava',
                        from: router.asPath,
                        base: props.item.id(),
                        type: props.item.type
                    })
 */

