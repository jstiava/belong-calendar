"use client"
import React, { JSX, useEffect, useState } from 'react';

import {
    Menu as MenuIcon
} from '@mui/icons-material';


import {
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useRouter } from 'next/router';
const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";

interface HeaderProps {
    children: JSX.Element;
}

export default function CalendarSelectedHeader(props: HeaderProps) {
    const router = useRouter();
    const theme = useTheme();

    const [prevScrollPos, setPrevScrollPos] = useState<number | null>(null);
    const [visible, setVisible] = useState(true);
    const [isOpenDropDown, setIsOpenDropDown] = useState<boolean>(false);
    const isSM = useMediaQuery(theme.breakpoints.down("sm"));
    const isXS = useMediaQuery(theme.breakpoints.down("xs"));

    const handleScroll = () => {
        console.log('Handle scroll');

        if (!prevScrollPos) {
            setPrevScrollPos(window.scrollY);
            console.log('No prev scroll pos');
            return;
        }
        const currentScrollPos = window.scrollY;
        if (!currentScrollPos) return;
        const isVisible = prevScrollPos > currentScrollPos;

        setVisible(isVisible);
        setPrevScrollPos(currentScrollPos);
    };

    useEffect(() => {
        if (!isSM) {
            setIsOpenDropDown(false)
        }
    }, [isSM])

    const toggleDropDown = () => {
        setIsOpenDropDown(prevDropDown => !prevDropDown)
    }

    useEffect(() => {
        try {
            if (!window) return;
            setPrevScrollPos(window.scrollY);
        } catch (err) {
            return;
        }
    }, []);

    useEffect(() => {
        if (!window) return;
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevScrollPos]);


    return (
        <>
            <header
                id="header"

                className='flex between'
                style={{
                    position: "fixed",
                    top: 0,
                    background: theme.palette.primary.main,
                    borderBottom: "1px solid",
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    // zIndex: 1000,
                    width: "calc(100% - 20rem)"
                }}
            >
                <div className="flex center fit" >
                    {props.children}
                </div>

                <div className="flex center fit">
                    <IconButton
                        sx={{
                            color: theme.palette.primary.contrastText,
                            display: isSM ? 'block' : 'none'
                        }}
                        onClick={toggleDropDown}
                    >
                        <MenuIcon />
                    </IconButton>
                </div>

            </header>

        </>
    );
}
