import { useEffect, useState } from 'react';
import { CalendarMonthOutlined, LinkOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import { alpha, Avatar, ButtonBase, IconButton, Typography, useTheme } from "@mui/material";
import { Event, Member, Schedule } from '@/schema';
import { Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { DragOverlay, useDraggable } from '@dnd-kit/core'
import { StartViewer } from '@/lib/global/useView';
import dayjs from '@/lib/utils/dayjs';
import { useRouter } from 'next/router';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import { isMoment } from '@/lib/CalendarDays';

export default function EventSidebarCard({ id, event, startCreator, base, startViewer }: { id?: string; event: Event; startCreator: StartCreator, base: Member, startViewer: StartViewer }) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const router = useRouter();
    const theme = useTheme();

    const handleRightClick = (e: any) => {
        e.preventDefault();
        startViewer(Type.Event, event, { e, date: dayjs(), isRightClick: true });
    }

    const junction = event.junctions.get(base.id());

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: event.id(),
        data: event
    });

    const [schedule, setSchedule] = useState<Schedule | null>(null);

    useEffect(() => {
        if (!schedule && event) {
            const activeSchedule = event.getSchedulesInFrame();
            if (!activeSchedule) {
                return;
            }
            console.log(activeSchedule[0]);
            setSchedule(activeSchedule.length > 0 ? activeSchedule[0] : null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    return (
        <>
            {isDragging && (
                <DragOverlay>
                    <ButtonBase
                        {...listeners} {...attributes}
                        className="flex between"
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            border: `3px solid ${event.theme_color || theme.palette.primary.main}`,
                            padding: "0.05rem 1rem",
                            borderRadius: "0.25rem",
                            width: "10rem"
                        }}
                    >
                        <div className="flex compact">
                            <Avatar
                                key={event.uuid}
                                sx={{
                                    width: 25,
                                    height: 25,
                                    fontSize: "0.85rem",
                                    backgroundColor: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    border: `2px solid ${event.theme_color || theme.palette.primary.main}`,
                                    margin: "0.5rem 0.5rem 0.5rem 0"
                                }}
                                alt={event.name || ""}
                                src={`${MEDIA_BASE_URI}/${event.getIconPath(true)}`}
                            >
                                {event.link ? <LinkOutlined /> : <CalendarMonthOutlined fontSize="small" />}
                            </Avatar>
                            <Typography sx={{
                                fontSize: "0.85rem",
                                width: "calc(100% - 40px)",
                                textAlign: "left",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                overflow: "clip",
                                textOverflow: "ellipsis"
                            }}>{event.name}</Typography>
                        </div>
                        <div
                            className="flex compact fit"
                            style={{
                                position: "absolute",
                                right: "0.5rem"
                            }}
                        >
                            {/* <div style={{
                                border: `2px solid ${theme.palette.text.primary}`,
                                backgroundColor: theme.palette.background.paper,
                                width: "1rem",
                                height: "1rem",
                                borderRadius: "0.1rem"
                              }}></div> */}
                        </div>
                    </ButtonBase >
                </DragOverlay>
            )}
            <div ref={setNodeRef} key={event.id()}>
                <ButtonBase
                    {...listeners} {...attributes}
                    className="flex between"
                    onContextMenu={handleRightClick}
                    onClick={async (e) => {
                        router.push(`/event/${event.id()}?base=${router.query.base}`)
                    }}
                    sx={{
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.text.primary, 0.05)
                        },
                        padding: "0.05rem 1rem",
                        height: isMoment(event) ? "1.5rem" : "2.5rem",
                        borderRadius: "0.25rem",
                        width: "100%",
                        opacity: junction && junction.is_shown ? 1 : 0.5
                    }}
                >
                    <div className="flex compact">
                        {isMoment(event) ? (
                            <div
                                key="moment_icon"
                            >

                            <div
                                style={{
                                    width: "0.5rem",
                                    height: "0.5rem",
                                    borderRadius: "100vh",
                                    border: `3px solid ${event.theme_color || theme.palette.primary.main}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                    boxShadow: `${theme.palette.background.paper} 0px 5px 15px`,
                                }}></div>
                            </div>
                        ) : (
                            <Avatar
                                key={event.uuid}
                                sx={{
                                    width: 25,
                                    height: 25,
                                    fontSize: "0.85rem",
                                    backgroundColor: event.theme_color || theme.palette.background.paper,
                                    color: event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.text.primary,
                                    border: `0.15rem solid ${event.theme_color || theme.palette.primary.main}`,
                                    margin: "0.5rem 0.5rem 0.5rem 0",

                                }}
                                alt={event.name || ""}
                                src={`${MEDIA_BASE_URI}/${event.getIconPath(true)}`}
                            >

                                {event.link ? <LinkOutlined sx={{
                                    fontSize: "0.85rem",
                                    color: 'inherit'
                                }} /> : <CalendarMonthOutlined fontSize="small" sx={{
                                    fontSize: "0.85rem",
                                    color: 'inherit'
                                }} />}
                            </Avatar>
                        )}
                        {junction && !junction.is_shown && (
                            <VisibilityOffOutlined sx={{
                                fontSize: "0.875rem"
                            }} />
                        )}
                        <Typography sx={{
                            fontSize: "0.85rem",
                            width: isMoment(event) ? "calc(100% - 2.5rem)" : "calc(100% - 5.5rem)",
                            textAlign: "left",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "clip",
                            textOverflow: "ellipsis"
                        }}>{event.name}</Typography>
                    </div>
                    <div
                        className="flex compact fit"
                        style={{
                            position: "absolute",
                            right: "0.5rem"
                        }}
                    >
                        {event.date && <Typography sx={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: "0.25rem"
                        }} variant="caption">{event.date.getDeixis("MMM D", true)}</Typography>}
                        {schedule && (
                            <>
                                {schedule.getActiveDaysPerWeek() > 3 ? (
                                    <Typography sx={{
                                        padding: "0.25rem 0.5rem",
                                        backgroundColor: theme.palette.background.paper,
                                        borderRadius: "0.25rem",
                                        opacity: schedule.isOpen() ? 1 : 0.5
                                    }} variant="caption">{schedule.isOpen() ? "OPEN" : "CLOSED"}</Typography>
                                ) : (
                                    <Typography sx={{
                                        padding: "0.25rem 0.5rem",
                                        backgroundColor: theme.palette.background.paper,
                                        borderRadius: "0.25rem",
                                        opacity: schedule.isOpen() ? 1 : 0.5
                                    }} variant="caption">{schedule.isOpen() ? "NOW" : ""}</Typography>
                                )}
                            </>
                        )}
                    </div>
                </ButtonBase >
            </div>
        </>
    )
}