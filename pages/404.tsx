'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { Button, Typography, useTheme } from '@mui/material';

const CalendarPage = (props: AppPageProps) => {

    const theme = useTheme();
    const router = useRouter();

    return (
        <>
            <div id="content" className='flex middle' style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, minHeight: "100vh", width: "100%" }}>
                <div className="flex column center middle" style={{ width: "100%", height: "100%" }}>
                    <Typography variant='h2'>404 Error</Typography>
                    <Button color="primary" onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        </>
    );

}

export default CalendarPage;