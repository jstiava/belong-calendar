import React, { useState } from 'react';
import { Avatar, AvatarGroup, Button, ButtonBase, Typography, useTheme, ToggleButton } from '@mui/material';
import { UseSession } from '@/lib/global/useSession';
import { CopyAllOutlined, FilterList, Fullscreen, LanguageOutlined, LockOutlined, SendOutlined } from '@mui/icons-material';
import { SIDEBAR_WIDTH } from './Sidebar';
import { UseBase } from '@/lib/global/useBase';
import { Member, MemberFactory, dayjs } from '@jstiava/chronos';
import StyledToggleButtonGroup from '../StyledToggleButtonGroup';
import ItemStub from '../ItemStub';
import { useRouter } from 'next/router';
import SmallTextField from '../SmallTextField';
import ResolveItemIcon from '../ResolveItemIcon';
import StyledIconButton from '../StyledIconButton';
import Flyout from '../Flyout';
import axiosInstance from '@/lib/utils/axios';
import { useSnackbar } from 'notistack';


const Footer = ({
  Session,
  Base,
  Module,
  module
}: {
  Session: UseSession,
  Base?: UseBase,
  Module?: UseBase,
  module?: Member | null
}) => {

  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const Controller = router.asPath.startsWith('/me') ? Session : module ? Module : Base;
  const item = router.asPath.startsWith('/me') ? Session.session : module ? module : Session.base;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const [anchorElForIAM, setAnchorElForIAM] = useState<HTMLButtonElement | null>(null);
  const isIAMOpen = Boolean(anchorElForIAM);

  const [searchQuery, setSearchQuery] = useState(null);
  const [searchResults, setSearchResults] = useState<Member[] | null>(null);

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

  if (!Controller || !item) {
    return null;
  }

  return (
    <>
      <footer id="footer"
        className="flex center between"
        style={{
          position: 'fixed',
          bottom: 0,
          height: "2.5rem",
          borderTop: `0.1rem solid ${theme.palette.divider}`,
          borderBottom: `0.1rem solid ${theme.palette.divider}`,
          padding: "0 1rem",
          width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH} - 0.1rem)`,
        }}>
        <div className="flex fit">
          <Button
            disableRipple
            className="flex compact fit"
            sx={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              color: theme.palette.text.primary,
              width: 'fit-content'
            }}
          >
            <LanguageOutlined sx={{
              fontSize: "1rem",
            }} />
            <Typography sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              opacity: 0.75,
              // textTransform: 'uppercase'
            }}>America/Chicago (Hard-coded) ({dayjs().tz('America/Chicago').format("z Z")})</Typography>
          </Button>
          <Button
            onClick={(e: any) => {
              const target = e.currentTarget || e.target;
              setAnchorEl(target)
            }}
            disableRipple
            className="flex compact fit"
            sx={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              color: theme.palette.text.primary,
              width: 'fit-content'
            }}
          >
            <FilterList sx={{
              fontSize: "1rem",
            }} />
            <Typography sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: 'uppercase'
            }}>Filters</Typography>
          </Button>
          <Flyout
            isOpen={isOpen}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            sx={{
              padding: "1.5rem",
              width: "15rem"
            }}
          >
            <div className="flex compact wrap" style={{
              marginBottom: '-0.5rem'
            }}>
              {Controller?.Events.colors && Controller?.Events.colors.values().map(color => {
                return (
                  <div
                    key={color}
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderRadius: '100vh',
                      backgroundColor: color,
                      // border: `0.15rem solid ${theme.palette.getContrastText(color)}`,
                      marginBottom: '0.5rem'
                    }}
                  ></div>
                )
              })}
            </div>
          </Flyout>
          <Typography sx={{
            fontSize: "0.875rem",
            opacity: 0.75,
            whiteSpace: 'no-wrap',
            width: 'fit-content'
          }}>Nothing is hidden.</Typography>
        </div>
        <div className="flex fit">
          <div className="flex compact fit">

            {Controller && ('IAM' in Controller) && Controller.IAM.members && (
              <Button
                disableRipple
                className="flex compact fit"
                sx={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  color: theme.palette.text.primary,
                  width: 'fit-content'
                }}
                onClick={(e: any) => {
                  const target = e.currentTarget || e.target;
                  setAnchorElForIAM(target)
                }}
              >
                <AvatarGroup
                  spacing={20}
                  sx={{
                    height: "1.75rem"
                  }}
                >
                  {Controller.IAM.members.map(x => {
                    return (
                      <Avatar
                        key={x.id()}
                        sx={{
                          width: "1.5rem",
                          height: "1.5rem",
                          backgroundColor: x.theme_color
                        }}
                      >
                        <ResolveItemIcon
                          item={x}
                          sx={{
                            fontSize: "0.875rem"
                          }}
                        />
                      </Avatar>
                    )
                  })}
                </AvatarGroup>
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textTransform: 'uppercase'
                }}>Share</Typography>
              </Button>
            )}

            <Button
              disableRipple
              className="flex compact fit"
              sx={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                color: theme.palette.text.primary,
                width: 'fit-content'
              }}
            >
              <LockOutlined sx={{
                fontSize: "1rem"
              }} />
              <Typography sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: 'uppercase'
              }}>Private</Typography>
            </Button>
          </div>
        </div>
      </footer>

      <Flyout

        isOpen={isIAMOpen}
        anchorEl={anchorElForIAM}
        onClose={() => setAnchorElForIAM(null)}
        sx={{
          padding: "0.5rem",
          width: "32.5rem"
        }}
      >
        <div
          className="column"
          style={{
            width: "100%",
            borderRadius: "0.25rem",
            padding: '1rem 1rem',
            position: 'relative'
          }}>

          <div className="flex between">


            <StyledToggleButtonGroup value="all">
              <ToggleButton value="all">
                All
              </ToggleButton>
            </StyledToggleButtonGroup>

            <div className="flex fit" style={{
              position: 'absolute',
              top: "0.5rem",
              right: "0.5rem"
            }}>

              <StyledIconButton
                title={"Expand"}
                onClick={() => {
                  pushNewView('iam');

                }}
              >
                <Fullscreen sx={{
                  fontSize: "1rem"
                }} />
              </StyledIconButton>
            </div>
          </div>
          {/* <Typography variant="h6">Shared with</Typography> */}

          {Controller && ('IAM' in Controller) && (
            <div className="column relaxed">
              <div className="column compact">
                {Controller.IAM.members && Controller.IAM.members.map((item) => {
                  return (
                    <ButtonBase
                      key={item.id()}
                      className="flex between"
                    >
                      <div className="flex fit">
                        <ItemStub
                          item={item}
                        />
                      </div>

                      <Typography variant="caption">Admin</Typography>
                    </ButtonBase>
                  )
                })}
              </div>

              <div className="column">
                <div className="flex">
                  <SmallTextField
                    size='small'
                    // icon={<SearchOutlined />}
                    placeholder='Search'
                    onChange={e => {
                      const query = e.target.value;
                      const bases = Session.search(query);
                      const theEvents = Session.Events.search(query);
                      const eventsFromBase = Base ? Base.Events.search(query) : [];

                      setSearchResults([...bases, ...theEvents, ...eventsFromBase])
                    }}

                  />
                  <Button sx={{
                    width: 'fit-content'
                  }}
                    endIcon={<SendOutlined />}
                  >Invite</Button>
                </div>
                <div className="column">
                  {searchResults && searchResults.map(item => (
                    <ItemStub
                      key={item.id()}
                      item={item}
                      onClick={() => {
                        return;
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button
                startIcon={<CopyAllOutlined />}
                sx={{
                  width: 'fit-content'
                }}
                onClick={e => {

                  enqueueSnackbar('Generating link...', {
                    variant: 'warning',
                    autoHideDuration: 500
                  })

                  axiosInstance.get(`/api/v1/iam/invite`, {
                    params: {
                      type: 'invite_link',
                      source: MemberFactory.getToken(item)
                    }
                  })
                    .then(res => {
                      navigator.clipboard.writeText(res.data.link).then(() => {
                        enqueueSnackbar('Link copied', {
                          variant: 'success'
                        })
                      }).catch((err) => {
                        enqueueSnackbar('Something went wrong.', {
                          variant: 'error'
                        })
                      });

                    })


                }}
              >Copy Invite Link</Button>
            </div>
          )}

        </div>
      </Flyout>
    </>

  );
};

export default Footer;