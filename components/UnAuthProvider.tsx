"use client"
import { GetServerSideProps, GetServerSidePropsContext, NextComponentType, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import MockupOne from '@/public/MockupOne.png';
import ThingsToDoArt from '@/public/ArtForThingsToDo.png';
import { Avatar, Button, createTheme, ThemeProvider, Typography, useTheme, Tabs, Tab, AvatarGroup, ToggleButton, alpha, Link, IconButton, Tooltip, useMediaQuery, Drawer } from '@mui/material';
import { Sora } from 'next/font/google';
import StyledToggleButtonGroup from '@/components/StyledToggleButtonGroup';
import { AccessibilityNewOutlined, AttributionOutlined, CalendarMonthOutlined, CloseOutlined, CodeOutlined, DarkModeOutlined, GridView, HomeOutlined, LocationOnOutlined, MenuOutlined, PeopleOutlined, Person2Outlined, PersonOutline, StoreOutlined } from '@mui/icons-material';
import { UseSession } from '@/lib/global/useSession';
import GmailTreeView, { CustomTreeItem } from '@/components/layout/TreeMenu';


const sora = Sora({ subsets: ['latin'] });

export default function AuthProvider({
    Component,
    pageProps,
    Session,
}: {
    Component: NextComponentType<NextPageContext, any, any>;
    Session: UseSession;
    pageProps: any;
}) {
    const theme = useTheme();

    return (
        <>
            <Component {...pageProps} Session={Session} />
        </>
    );
}
