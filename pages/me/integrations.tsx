'use client';
import { AppPageProps, BaseService, Mode, Type } from '@/types/globals';
import { useRouter } from 'next/router';
import { Avatar, Button, lighten, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import { Group, Event } from '@jstiava/chronos';
import axiosInstance from '@/lib/utils/axios';
import ResolveItemIcon from '@/components/ResolveItemIcon';


const Actions = {
}


export const IntegrationTemplates = [
    {
        name: "Connect to Jotform",
        slug: 'jotform',
        url: "https://api.jotform.com/user/",
        type: "Key",
        theme_color: '#0097ff',
        subtitle: "Import a form, extend its functionality, track respondents, manage your notifications, and close automatically.",
        query: {},
        events: [
            {
                slug: '@newForm',
                name: "With New Form",
                isRequired: false,
                result: Type.Event
            }
        ],
        types: {
            '#jotform.form': {
                events: [
                    {
                        slug: '@submit',
                        name: "With New Submit",
                        description: "",
                        isRequired: true,
                        result: Type.Event,
                    }
                ],
                actions: [
                    {
                        slug: 'doCloseForm',
                        name: "Close Form"
                    },
                    {
                        slug: 'doOpenForm',
                        name: 'Open Form'
                    }
                ]
            }
        }
    },
    {
        name: "Connect to Strava",
        slug: 'strava',
        url: 'https://www.strava.com/oauth/authorize',
        type: "OAuth2",
        subtitle: "Import my activities, track workouts, and visualize progress.",
        theme_color: '#f44a02',
        query: {
            client_id: "141535",
            response_type: 'code',
            approval_prompt: 'force',
            scope: 'read,activity:read_all',
        },
    },
    {
        name: "Connect to Stripe",
        slug: 'stripe',
        url: 'https://connect.stripe.com/oauth/authorize',
        type: "OAuth2",
        subtitle: "Display orders, track fufillment, and analyze your business processes.",
        theme_color: '#533afd',
        query: {
            client_id: "ca_SIl1FyP14rYz4LuNiwH2DpuyBaUelnjl",
            response_type: 'code',
            scope: 'read_write'
        },
    },
    {
        name: "Connect with Stripe API Key",
        slug: 'stripeAPI',
        url: 'https://connect.stripe.com/oauth/authorize',
        type: "Key",
        subtitle: "Display orders, track fufillment, and analyze your business processes.",
        theme_color: '#533afd',
        query: {
            // API-Key
        },
    },
    {
        name: "Connect to Google",
        slug: 'google',
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        type: "OAuth2",
        subtitle: "Use all google tools and services.",
        theme_color: '#517ec0',
        query: {
            client_id: "178207176567-epjahnmagdcfpnb0j27eskhu4rvl6e6c.apps.googleusercontent.com",
            response_type: "code",
            scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/forms.responses.readonly",
            access_type: "offline",
            prompt: "consent"
        },
    },
    {
        name: "Github",
        slug: 'github',
        url: "https://github.com/login/oauth/authorize",
        type: "OAuth2",
        subtitle: "Enter a name, date and time, schedule, and creative additions.",
        theme_color: '#002155',
        query: {
            client_id: "Iv23liT56uQvuP29AUtr",
            scope: 'repo, notifications',
        },
    },
    {
        name: "Connect to Clickup",
        slug: 'clickup',
        url: "https://app.clickup.com/api",
        type: "OAuth2",
        subtitle: "Integrate with a todo manager.",
        theme_color: '#7612fa',
        query: {
            client_id: "B7AD2VPD2X1DT2KFJSMNBMZC4LENX6RM",
            state: ''
        },
    },
     {
        name: "Connect to Instagram (Meta)",
        slug: 'instagram',
        url: "https://api.instagram.com/oauth/authorize",
        type: "OAuth2",
        subtitle: "Integrate with your social media.",
        theme_color: '#DD2A7B',
        query: {
            client_id: "714918767854790",
            scope: 'name,email'
        },
    },
    {
        name: "Connect to Canvas (Instructure)",
        slug: 'canvas',
        url: "http://localhost:3000/api/v1/auth/callback",
        type: "OAuth2",
        subtitle: "Integrate with your studies.",
        theme_color: '#e4060f',
        query: {},
    },
    {
        name: "Connect to Zoom",
        slug: 'zoom',
        url: "https://zoom.us/oauth/authorize",
        type: "OAuth2",
        subtitle: "Integrate with your online meetings.",
        theme_color: '#0E71EB',
        query: {
            client_id: "wG4mKL93TpWSnBbsMJesdw",
            response_type: "code",
        },
        types: {
            '#zoom.meeting': {
                events: [],
                actions: [
                    {
                        slug: 'doCreateMeeting',
                        name: "Create Meeting"
                    }
                ]
            }
        }
    },
]

const MainBasePage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const Session = props.Session;
    const Base = props.Base;
    const item = props.Session.session;
    const columns = 3;
    const delayStep = 100;

    const [newItem, setNewItem] = useState(item);
    const prefix = '/me/';

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

    const handleIntegrate = (integration: any) => {

        router.push({
            pathname: integration.url,
            query: {
                ...integration.query,
                redirect_uri: 'https://belong.day/api/v1/auth/callback',
                state: JSON.stringify({
                    integration: integration.slug,
                    from: router.asPath,
                    base: props.Session.session.id(),
                    type: Type.Profile
                })
            }
        })
    }

    return (
        <div id="main"
            className="column relaxed"
            style={{
                padding: "2rem"
            }}>
            <div className="column compact">
                <Typography variant="h4">Integrations</Typography>
                <Typography>Import. Watch. Analyze. Grow. Do more.</Typography>
            </div>

            <div className="flex wrap top" style={{
                flexWrap: 'wrap'
            }}>

                {IntegrationTemplates.map(x => {
                    return (
                        <div
                            key={x.name}
                            className="column snug"
                            style={{
                                margin: "0 1rem 1rem 0",
                                width: "20rem",
                                backgroundColor: lighten(x.theme_color, 0.9),
                                borderRadius: '0.25rem'
                            }} >

                            <div
                                className="column compact right"
                                style={{
                                    padding: "1.25rem 1.5rem",
                                }}
                            >

                                <div className="flex top">
                                    <Avatar
                                        alt={x.slug}
                                        sx={{
                                            width: "2.5rem",
                                            height: "2.5rem",
                                            // border: `0.15rem solid ${parent.theme_color || 'transparent'} !important`,
                                            backgroundColor: x.theme_color,
                                            color: theme.palette.getContrastText(x.theme_color)
                                        }}
                                    >
                                        <ResolveItemIcon
                                            item={{
                                                type: Type.Group,
                                                integration: x.slug
                                            }}
                                            sx={{
                                                color: theme.palette.getContrastText(x.theme_color)
                                            }}
                                        />
                                    </Avatar>
                                    <div className="column snug left">
                                        <Typography variant="h6" sx={{
                                            textTransform: 'capitalize !important'
                                        }}>{x.name}</Typography>
                                        <Typography variant="caption" sx={{
                                            height: "4rem"
                                        }}>{x.subtitle}</Typography>
                                    </div>
                                </div>

                                <Button sx={{
                                    color: x.theme_color,
                                }}
                                    onClick={() => {

                                        if (x.type === 'OAuth2') {
                                            handleIntegrate(x);
                                            return;
                                        }
                                        props.Session.Creator.startCreator(Type.Custom, Mode.Create, null, {
                                            doNotPrepJunctions: true,
                                            callback: async (item: any) => {
                                                axiosInstance.get(`/api/v1/auth/identify`, {
                                                    params: {
                                                        apiKey: item.apiKey,
                                                        integration: x.slug
                                                    }
                                                })
                                                    .then(res => {
                                                        console.log(res)

                                                        const newBase = new Group(res.data.identity);
                                                        props.Session.addNewBase(newBase.eject())
                                                            .then(res => {
                                                                router.push('/me')
                                                            })
                                                            .catch(err => {
                                                                console.error(err);
                                                            })

                                                    })
                                                    .catch(err => [
                                                        console.error(err)
                                                    ])

                                                return;
                                            }
                                        });

                                        return;
                                    }}
                                >Configure</Button>

                            </div>
                        </div>
                    )
                })}

            </div>
        </div>
    );
}

export default MainBasePage;
