import { useEffect, useState } from 'react';
import { CalendarMonthOutlined, LocationOnOutlined } from "@mui/icons-material";
import { alpha, Avatar, ButtonBase, Typography, useTheme } from "@mui/material";
import { Event, Location, Member, Schedule } from '@/schema';
import { Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { DragOverlay, useDraggable } from '@dnd-kit/core'
import { StartViewer } from '@/lib/global/useView';
import dayjs from '@/lib/utils/dayjs';
import { useRouter } from 'next/router';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';

export default function LocationSidebarCard({ id, location, startCreator, base, startViewer }: { id?: string; location: Location; startCreator: StartCreator, base: Member, startViewer: StartViewer }) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const router = useRouter();
    const theme = useTheme();

    const handleRightClick = (e: any) => {
        e.preventDefault();
        // startViewer(Type.Event, event, { e, date: dayjs(), isRightClick: true });
    }

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: location.id(),
        data: location
    });

    const [schedule, setSchedule] = useState<Schedule | null>(null);

    return (
        <>
            {isDragging && (
                <></>
            )}
            <div ref={setNodeRef} key={location.id()}>
                <ButtonBase
                    {...listeners} {...attributes}
                    className="flex between"
                    onContextMenu={handleRightClick}
                    onClick={async (e) => {
                        router.push(`/location/${id}?base=${router.query.base}`)
                        // startViewer(Type.Location, location, { e, date: dayjs() });
                    }}
                    sx={{
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.text.primary, 0.05)
                        },
                        padding: "0.05rem 1rem",
                        borderRadius: "0.25rem",
                        width: "100%"
                    }}
                >
                    <div className="flex compact">
                        <Avatar
                            key={location.uuid}
                            sx={{
                                width: 25,
                                height: 25,
                                fontSize: "0.85rem",
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                border: `2px solid ${location.theme_color || theme.palette.primary.main}`,
                                margin: "0.5rem 0.5rem 0.5rem 0"
                            }}
                            alt={location.name || ""}
                            src={`${MEDIA_BASE_URI}/${location.getIconPath(true)}`}
                        >
                            <LocationOnOutlined sx={{
                                fontSize: "0.85rem",
                                width: "0.8rem",
                                textAlign: 'center',
                                color: location.theme_color || theme.palette.text.primary
                            }} />
                        </Avatar>
                        <Typography sx={{
                            fontSize: "0.85rem",
                            width: "calc(100% - 5.5rem)",
                            textAlign: "left",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "clip",
                            textOverflow: "ellipsis"
                        }}>{location.name}</Typography>
                    </div>
                    <div
                        className="flex compact fit"
                        style={{
                            position: "absolute",
                            right: "0.5rem"
                        }}
                    >


                    </div>
                </ButtonBase >
            </div>
        </>
    )
}