'use client';
import { AppPageProps } from '@/types/globals';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Avatar, Button, ButtonBase, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import useIAM from '@/lib/global/useIAM';
import LargeTextField from '@/components/LargeTextField';
import SmallTextField from '@/components/SmallTextField';
import LargeBaseCard from '@/components/bases/LargeBaseCard';
import { Group } from '@jstiava/chronos';
import ItemStub from '@/components/ItemStub';

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
            <div className="column snug">
            <Typography variant="h4">Apps</Typography>
            <Typography>Publish your data.</Typography>
            </div>
        </div>
    );
}

export default MainBasePage;
