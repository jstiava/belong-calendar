import { MouseEvent, useState, useEffect, CSSProperties } from 'react';
import { AccessTime, DateRangeOutlined, EventOutlined, LocationOnOutlined, RemoveCircleOutline } from "@mui/icons-material";
import { alpha, Button, ButtonBase, Checkbox, darken, FormControlLabel, IconButton, lighten, SxProps, Tooltip, Typography, useTheme } from "@mui/material";
import { Event, Schedule } from '@/schema';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';

export default function MerchantChildEditCard({ item, onClick, style = {}, hideIfClosed = false, isOpen = false, mini = false, className = "", dateTime = dayjs(), soften = false, onSelect }: { item: Event; onClick?: (e: MouseEvent) => any; style?: any, hideIfClosed?: boolean, isOpen?: boolean, mini?: boolean, className?: string, dateTime?: Dayjs, soften?: boolean, onSelect: any }) {

    const theme = useTheme();

    const [nextInstance, setNextInstance] = useState(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);

    useEffect(() => {
        const activeSchedule = item.getSchedulesInFrame(dateTime, dateTime.toLocalChronos());
        if (!activeSchedule) {
            return;
        }
        // console.log(activeSchedule[0]);
        setSchedule(activeSchedule.length > 0 ? activeSchedule[0] : null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item, dateTime]);

    const resolveBackground = () => {
        if (!theme || !schedule || !item) {
            return 'null';
        }

        let items = [];

        if (schedule.isOpen()) {
            items.push(`linear-gradient(${style.backgroundColor || alpha(soften ? theme.palette.background.paper : theme.palette.primary.main, 0.65)}, ${style.backgroundColor || alpha(soften ? theme.palette.background.paper : theme.palette.primary.main, 0.65)})`)
        }
        else {
            items.push(`linear-gradient(${style.backgroundColor || darken(soften ? theme.palette.background.paper : theme.palette.primary.main, 0.1)}, ${style.backgroundColor || darken(soften ? theme.palette.background.paper : theme.palette.primary.main, 0.1)})`)
        }

        if (item.cover_img) {
            items.push(`url(${MEDIA_BASE_URI}/${item.getCoverImageLink()})`);
        }

        return items.join(', ');
    }

    if (schedule && !schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) && hideIfClosed) {
        return null;
    }

    return (
        <>
            <ButtonBase
                key={item.id()}
                className={className}
                sx={{
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: "center",
                    width: style.width ? `${style.width} !important` : "100% !important",
                    height: mini ? '6.5rem' : '7rem',
                    padding: 0,
                    borderRadius: '0.5rem',
                    color: "inherit",
                    background: resolveBackground(),
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    border: `3px solid`,
                    opacity: schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? 1 : 0.75,
                    ...style,
                    borderColor: schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? style.borderColor || theme.palette.background.paper : style.backgroundColor || theme.palette.primary.main,
                }}
                onClick={onClick || undefined}
            >
                <div className="flex fit" style={{
                    position: "absolute",
                    right: "0.1rem",
                    top: "0.1rem",
                    zIndex: 5
                }}>
                    <Checkbox
                        checked
                        sx={{
                            color: theme.palette.text.primary,

                            '&.Mui-checked': {
                                color: theme.palette.text.primary,
                            },
                        }} onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }} />
                </div>
                <div
                    className="column left"
                    style={{
                        padding: "1rem 1rem",
                        width: "100%"
                    }}
                >
                    <div className="column compact2 left">
                        <Typography variant="h6" sx={{ textAlign: 'center', lineHeight: "125%", fontSize: mini ? "0.85rem" : "1rem" }}>{item.name}</Typography>
                        <div className="flex compact middle">
                            {nextInstance && (
                                <div className="flex compact2">
                                    <AccessTime />
                                    <Typography variant="caption" sx={{ textAlign: 'left' }}>{nextInstance.date.format("MMM DD")}{nextInstance.start_time && ` - ${nextInstance.start_time.print()}`}</Typography>
                                </div>
                            )}
                            {schedule && (
                                <>
                                    {isOpen ? (
                                        <div className="flex compact2 middle"
                                            style={{
                                                borderRadius: "100vh",
                                                padding: "0.25rem 0.5rem",
                                                backgroundColor: schedule && !schedule.isNotRegular() ? 'transparent' : 'gold',
                                                color: schedule && !schedule.isNotRegular() ? 'inherit' : 'black',
                                                width: 'fit-content'
                                            }}>
                                            <AccessTime fontSize='small' />
                                            <Typography variant="caption" sx={{ textAlign: 'left', fontWeight: 600, fontSize: "0.85rem" }}>{schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? "OPEN" : "CLOSED"}</Typography>

                                        </div>
                                    ) : (
                                        <div className="flex compact2">
                                            <AccessTime fontSize='small' />
                                            <Typography variant="caption" sx={{ textAlign: 'left' }}>{schedule.as_text}</Typography>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {!isOpen && <Button variant="flipped" size="small">Add to Calendar</Button>}
                </div>
            </ButtonBase>

        </>
    );
}