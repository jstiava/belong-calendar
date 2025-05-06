import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { Source_Sans_3 } from 'next/font/google';
import { useEffect, useState } from "react";
import { UnAuthPageProps } from "@/types/globals";
import { Group, Profile } from "@/schema";
import { useRouter } from "next/router";
import MonthView from "@/components/calendar/MonthView";
import AppLayout from "@/components/AppLayout";

const sora = Source_Sans_3({ subsets: ['latin'] });



const session = new Profile({
    "uuid": "a151902a-b398-4016-8a29-68bfa67842f3",
    "name": "jeremystiava",
    "nickname": "jeremystiava",
    "username": "jeremystiava",
    "email": "jeremystiava",
    "valid": false,
    "icon_img": null
})

const source = new Group({
    "uuid": "f3822ce1-dd00-4e7d-86b1-2cfe5ec48237",
    "name": "Jeremy Stiava",
    "theme_color": "#a51417",
    "valid": null,
    "nickname": null,
    "username": "jeremy_stiava",
    "tagline": null,
    "cover_img": null,
    "icon_img": null,
    "access_token": null,
    "access_token_expires": null,
    "refresh_token": null,
    "refresh_token_expires": null,
    "scope": null,
    "integration": null
});


export default function ThemePage(props: UnAuthPageProps) {

    const theme = useTheme();
    const router = useRouter();


    return (
        <>
            {/* <Typography>{JSON.stringify(QUESTIONS)}</Typography> */}
        </>
    )
}