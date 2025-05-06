'use client';
import { AppPageProps } from '@/types/globals';
import { useRouter } from 'next/router';
import { Button, lighten, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import { Group } from '@/schema';

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

            <div className="flex wrap compact top" style={{
                flexWrap: 'wrap'
            }}>
                <div
                    className="column compact right"
                    style={{
                        padding: "1.25rem 1.5rem",
                        maxWidth: "20rem",
                        backgroundColor: lighten("#FF6100", 0.9),
                        borderRadius: '0.25rem'
                    }}
                >
                    <div className="column compact left">
                        <Typography variant="h6" sx={{
                            textTransform: 'capitalize !important'
                        }}>Connect to Jotform</Typography>
                        <Typography variant="caption">Import a form, extend its functionality, track respondents, manage your notifications, and close automatically.</Typography>
                    </div>
                    <Button sx={{
                        color: "#FF6100"
                    }}>Configure</Button>

                </div>

                <div
                    className="column compact right"
                    style={{
                        padding: "1.25rem 1.5rem",
                        maxWidth: "20rem",
                        backgroundColor: lighten("#FF6100", 0.9),
                        borderRadius: '0.25rem'
                    }}
                >
                    <div className="column compact left">
                        <Typography variant="h6" sx={{
                            textTransform: 'capitalize !important'
                        }}>Connect to Strava</Typography>
                        <Typography variant="caption">Import my activities, track workouts, and visualize progress.</Typography>
                    </div>
                    <Button sx={{
                        color: "#FF6100"
                    }}>Connect</Button>

                </div>
            </div>
        </div>
    );
}

export default MainBasePage;
