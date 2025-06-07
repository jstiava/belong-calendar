'use client';
import { AppPageProps, Mode, Type } from '@/types/globals';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Avatar, Button, ButtonBase, lighten, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, CSSProperties, useEffect, useState } from 'react';
import axiosInstance from '@/lib/utils/axios';
import { MemberFactory } from '@/schema';
import ResolveItemIcon from '@/components/ResolveItemIcon';
import StyledIconButton from '@/components/StyledIconButton';
import { ArrowBackIosNewOutlined, OpenInNewOutlined, RocketLaunchOutlined } from '@mui/icons-material';
import JotformForm from '@/components/icons/JotformForm';
import { Event } from '@/schema';
import { DIVIDER_NO_ALPHA_COLOR } from '@/components/Divider';
import GoogleCalendarIcon from '@/components/icons/GoogleCalendarIcon';
import { isNotScheduled } from '@/lib/CalendarDays';



const MainBasePage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const isSm = useMediaQuery(theme.breakpoints.down('sm'));

    const Session = props.Session;
    const item = props.module ? props.module : Session.base;
    const Controller = props.module ? props.Module : props.Base;

    const [actions, setActions] = useState<any>(null)

    useEffect(() => {

        setActions(null);

        if (!item) {
            return;
        }

        if (!item.integration) {
            return;
        }

        axiosInstance.get(`/api/v1/auth/${item.integration}/actions`, {
            params: {
                uuid: item.id(),
                source: MemberFactory.getToken(item)
            }
        })
            .then(res => {
                console.log(res)
                setActions(res.data.actions)
            })
            .catch(err => {
                console.log(err);
            })

    }, [props.module, Session.base, item]);


    return (
        <div id="main"
            className="column relaxed left"
            style={{
                padding: isSm ? "1rem" : "2rem"
            }}>
            <div className="flex fit">
                <Button
                    onClick={() => {
                        router.back();
                    }}
                    disableRipple
                    className="flex compact fit"
                    sx={{
                        color: theme.palette.text.primary
                    }}
                >
                    <ArrowBackIosNewOutlined sx={{
                        fontSize: '1rem'
                    }} />
                    <Typography variant="h6">Back</Typography>
                </Button>
            </div>

            {actions && actions.length > 0 && (
                <div className="column left" style={{
                    width: '100%',
                    padding: isSm ? "1rem": '2rem',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '0.25rem',
                    maxWidth: "40rem",
                }}>
                    <div className="flex compact center">
                        <RocketLaunchOutlined sx={{
                            fontSize: '1rem'
                        }} />
                        <Typography variant="h6">Getting Started</Typography>
                    </div>
                    <div className={isSm ? "column compact": "flex top wrap"}>
                        {actions.map((action: any) => {
                            try {
                                return (
                                    <ButtonBase
                                        key={action.local_id}
                                        disableRipple
                                        className="flex"
                                        style={{
                                            position: 'relative',
                                            width: isSm ? "100%" : "calc(50% - (2rem / 2))",
                                            marginBottom: "1rem",
                                            backgroundColor: `#09114110`,
                                            padding: "1.25rem 1.25rem",
                                            borderRadius: "0.25rem",
                                        }}
                                        onClick={() => {
                                            Controller.Creator.startCreator(Type.Event, Mode.Create, new Event({
                                                ...action.object,
                                                date: null,
                                                start_time: null,
                                                end_date: null,
                                                theme_color: '#091141'
                                            }), {
                                                integration: action.type
                                            })
                                        }}
                                    >
                                        <div className="flex top">
                                            <Avatar
                                                alt={item.name}
                                                sx={{
                                                    width: "2rem",
                                                    height: "2rem",
                                                    border: `0.15rem solid #091141 !important`,
                                                    backgroundColor: "#091141",
                                                    color: '#ffffff'
                                                }}
                                            >
                                                {action.type === '#jotform.form' && (
                                                    <JotformForm
                                                        sx={{
                                                            fontSize: "1.25rem",
                                                            color: item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.text.primary
                                                        }}
                                                    />
                                                )}
                                                {action.type === '#google.calendar' && (
                                                    <GoogleCalendarIcon
                                                        sx={{
                                                            fontSize: "1.25rem",
                                                            color: item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.text.primary
                                                        }}
                                                    />
                                                )}
                                            </Avatar>
                                            <div className="column compact right" style={{
                                                width: "calc(100% - 3rem)"
                                            }}>
                                                <Typography variant="h6" sx={{
                                                    textTransform: 'capitalize !important',
                                                    textAlign: 'left',
                                                    lineHeight: "115%",
                                                    width: "100%"
                                                }}>{action.object.name}</Typography>
                                                <Button>Import</Button>
                                            </div>
                                        </div>
                                    </ButtonBase>

                                )
                            }
                            catch (err) {
                                return null;
                            }
                        })}
                    </div>

                </div>
            )}
            <div className="column">

                <Typography variant="h3" component="h1" sx={{
                    fontSize: "2rem"
                }}><span dangerouslySetInnerHTML={{ __html: item.name }} /></Typography>

                {item instanceof Event && !isNotScheduled(item) && (
                   <div className="column left">
                    <Typography>{item.isOpen() ? "Open" : "Closed"}</Typography>
                     <Typography sx={{
                        whiteSpace: 'pre-wrap'
                    }}>
                        {JSON.stringify(item.schedules)}
                    </Typography>
                   </div>
                )}

                <Typography sx={{
                    whiteSpace: 'pre-wrap'
                }}>
                    {JSON.stringify(item)}
                </Typography>

                {item.metadata && (
                    <>
                        {item.metadata.data && Object.entries(item.metadata.data).map(([key, value]) => {

                            if (!value || typeof value != 'string') {
                                return null;
                            }

                            return (

                                <div key={key} className="flex between">
                                    <Typography>{key}</Typography>
                                    <Typography>{value}</Typography>
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    );
}

export default MainBasePage;
