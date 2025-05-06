import { SxProps } from "@mui/material"
import { Event, Group, Member, Profile } from "@/schema"
import { CalendarMonthOutlined, ElectricalServices, ElectricalServicesOutlined, Google, LocationOnOutlined, Microsoft, PersonOutline, WorkspacesOutlined } from "@mui/icons-material"
import Image from "next/image"
import GithubIcon from "./icons/GithubIcon"
import StravaIcon from "./icons/StravaIcon"
import JotformIcon from "./icons/Jotform"
import { Type } from "@/types/globals"

export default function ResolveItemIcon({
    item,
    sx = {}
}: {
    item: {
        type: Type,
        // integration?: string | null,
        [key: string]: any
    },
    sx?: SxProps
}) {

    if (item.type === Type.Event) {
        return <CalendarMonthOutlined sx={sx} />
    }

    if (item.type === Type.Group) {
        if (!item.integration) {
            return <WorkspacesOutlined sx={sx} />
        }

        if (item.integration === 'google') {
            return <Google sx={sx} />
        }
        else if (item.integration === 'github') {
            return <GithubIcon sx={sx} />
        }
        else if (item.integration === 'strava') {
            return <StravaIcon sx={sx} />
        }
        else if (item.integration === 'jotform') {
            return <JotformIcon sx={sx} />
        }
        else if (item.integration === 'outlook') {
            return <Microsoft sx={sx} />
        }
        else {
            return <ElectricalServicesOutlined sx={sx} />
        }
    }

    if (item.type === Type.Location) {
        return <LocationOnOutlined sx={sx} />
    }

    if (item.type === Type.Profile) {
        return <PersonOutline sx={sx} />
    }

    return <></>
}