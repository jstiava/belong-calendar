'use client';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import useIAM from '@/lib/global/useIAM';

const IntegrationsPage = (props: SessionProtectedAppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const Session = props.Session;
    const prefix = '/me/';
    const IAM = useIAM(props.Session.session, false);

    if (!Session.session || !IAM) {
        return <><Typography>Loading session page.</Typography></>
    }

    return (
        <div id="content">
             <div className="column">
                <Typography>Parents</Typography>
                {IAM.parents?.map(x => {
                    return (
                        <Typography key={x.uuid}>{JSON.stringify(x.eject(), null, 2)}</Typography>
                    )
                })}
                  <Typography>Members</Typography>
                {IAM.members?.map(x => {
                    return (
                        <Typography key={x.uuid}>{JSON.stringify(x, null, 2)}</Typography>
                    )
                })}
             </div>
        </div>
    );
}

export default IntegrationsPage;
