"use client"
import { ArrowBackIosOutlined, CalendarMonthOutlined, ChevronLeft, Google, GroupWorkOutlined, LocationOnOutlined, WorkspacesOutlined } from '@mui/icons-material';
import {
    Avatar,
    AvatarGroup,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { Event, Group, Location, Member } from '@/schema';
import { UseSession } from '@/lib/global/useSession';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { UseBase } from '@/lib/global/useBase';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import { getIntegrationIcon } from '@/types/globals';

interface LeftSideBarBaseAccordionModuleProps {
    Session: UseSession,
    Base: UseBase,
    Module: UseBase,
    module: Member | null,
    expanded: boolean,
    onChange: any,
    props?: any
}

export default function LeftSideBarBaseAccordionModule({
    Session,
    Base,
    Module,
    module,
    expanded,
    onChange,
    ...props
}: LeftSideBarBaseAccordionModuleProps) {

    const theme = useTheme();
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (e: any) => {
        e.preventDefault();
        onChange(e);
        // setAnchorEl(e.currentTarget);
    }
    const open = Boolean(anchorEl);
    const id = open ? 'menu-popover' : undefined;

    return (
        <>
            <div
                className='flex center between'
                style={{
                    position: 'relative',
                    padding: '0.6rem 1rem',
                    height: '3.5rem !important',
                    width: "100%",
                    cursor: "pointer",
                    marginLeft: Session.base && router.query.event ? "-0.6rem" : "0rem"
                }}
            >
                <div className="div compact2 flex" style={{ width: "calc(100% - 4rem)" }}>
                    {Session.base && router.query.event && (
                        <IconButton
                            onClick={(e) => {
                                router.push(`/be/${Session.base.id()}`);
                            }}
                        >
                            <ArrowBackIosOutlined sx={{
                                fontSize: "0.875rem"
                            }} />
                        </IconButton>
                    )}
                    {module && (router.query.event && Session.base) ? (
                        <AvatarGroup spacing="medium" sx={{ marginRight: "-0.75rem !important" }}>
                            <Avatar
                                alt={Session.session?.name}
                                src={`${MEDIA_BASE_URI}/${Session.base.getIconPath()}`}
                                sx={{
                                    transform: "translate(-0.25rem, -0.4rem)",
                                    width: "1rem",
                                    height: "1rem",
                                    border: `0.15rem solid ${Session.base.theme_color || 'transparent'} !important`,
                                    backgroundColor: theme.palette.background.paper
                                }}
                            >
                                {Session.base instanceof Event && <CalendarMonthOutlined fontSize="small" />}
                                {Session.base instanceof Group && <WorkspacesOutlined sx={{
                                    fontSize: "0.75rem",
                                    color: Session.base.theme_color
                                }} />}
                                {Session.base instanceof Location && <LocationOnOutlined sx={{
                                    fontSize: "0.875rem"
                                }} />}
                            </Avatar>
                            <Avatar
                                alt={module.name}
                                src={`${MEDIA_BASE_URI}/${module.getIconPath()}`}
                                sx={{
                                    transform: "translate(-35%, 0%)",
                                    width: "2rem",
                                    height: "2rem",
                                    backgroundColor: module.theme_color
                                }}
                            ><CalendarMonthOutlined fontSize="small" /></Avatar>
                        </AvatarGroup>
                    ) : (
                        <>
                            {Session.base && (
                                <Avatar
                                    sx={{
                                        width: "2rem",
                                        height: "2rem",
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        border: `2px solid ${theme.palette.primary.main}`,
                                    }}
                                    alt={Session.base.name || ''}
                                    src={Session.base instanceof Group && Session.base.integration ? getIntegrationIcon(Session.base.integration) || '' : `${MEDIA_BASE_URI}/${Session.base.getIconPath()}`}
                                >{Session.base.integration === 'google' ? (
                                    <Google fontSize="small"/>
                                  ) : (
                                    <GroupWorkOutlined fontSize="small" />
                                  )}</Avatar>
                            )}
                        </>
                    )}
                    <Typography sx={{
                        fontWeight: 500,
                        width: "100%",
                        display: '-webkit-box',
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: 'vertical',
                        textOverflow: "ellipsis",
                        whiteSpace: "initial",
                        wordWrap: 'break-word',
                        overflow: "hidden",
                        fontSize: "0.85rem",
                        marginLeft: "0.5rem",
                        lineHeight: "135%"
                    }}>{module && router.query.event ? module.name : Session.base ? Session.base.name : Session.session.name}</Typography>

                </div>
                <div className="flex snug fit" style={{
                    position: "absolute",
                    right: 0
                }}>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            Session.Preferences.setIsSidebarDocked(prev => !prev);
                        }}>
                        <ChevronLeft fontSize='small' />
                    </IconButton>
                </div>
            </div>
        </>

    );
}      
