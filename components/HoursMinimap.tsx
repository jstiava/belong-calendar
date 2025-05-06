import Chronos from "@/lib/utils/chronos";
import { Hours } from "@/lib/utils/medici"
import { Schedule } from "@/schema"
import { CloseOutlined, RemoveOutlined, WarningOutlined } from "@mui/icons-material";
import { Box, Button, ButtonBase, IconButton, TextField, ThemeProvider, Tooltip, Typography, useTheme } from "@mui/material"
import dayjs, { Dayjs } from "dayjs";
import { AnyARecord } from "dns";
import { useState } from "react";
import StyledDatePicker from "./StyledDatePicker";



const segments = [
    {
        label: "Early",
        caption: "2am-6am",
        start_time: 2,
        end_time: 6
    },
    {
        label: "Morning",
        caption: "6am-10am",
        start_time: 6,
        end_time: 10
    },
    {
        label: "Midday",
        caption: "10am-2pm",
        start_time: 10,
        end_time: 14
    },
    {
        label: "Afternoon",
        caption: "2pm-6pm",
        start_time: 14,
        end_time: 18
    },
    {
        label: "Evening",
        caption: "6pm-10pm",
        start_time: 18,
        end_time: 22
    },
    {
        label: "Late Night",
        caption: "10pm-2am",
        start_time: 22,
        end_time: 26
    }
]


function HoursBox({
    start,
    end,
    compact = false,
    onDelete
}: {
    start: number | null,
    end: number | null,
    compact?: boolean,
    onDelete: any
}) {

    const theme = useTheme();
    const [isHovering, setIsHovering] = useState(false);

    if (!start || !end) {
        return <></>
    }

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="column snug between center middle"
            style={{
                position: "absolute",
                top: `${100 * ((start * (1 / 24)) - 2 / 24)}%`,
                backgroundColor: `var(--bg-color)`,
                width: "100%",
                height: `${100 * ((end - start) * (1 / 24))}%`,
                borderRadius: "0.5rem",
                padding: "0.5rem 0",
                cursor: 'pointer'
            }}>
            {isHovering && (
                <IconButton onClick={onDelete}>
                    <CloseOutlined sx={{
                        fontSize: "1rem",
                        color: 'var(--text-color)'
                    }} />
                </IconButton>
            )}
            <div className="drag-handle top"
                style={{
                    height: "0.15rem",
                    borderRadius: "0.5rem",
                    backgroundColor: `var(--text-color)`,
                    width: isHovering ? "70%" : "50%",
                    position: "absolute",
                    top: "0.5rem",
                    cursor: "ns-resize",
                    transition: "0.1s ease-in-out width"
                }}></div>
            <div className="drag-handle bottom"
                style={{
                    height: "0.15rem",
                    borderRadius: "0.5rem",
                    backgroundColor: `var(--text-color)`,
                    width: isHovering ? "70%" : "50%",
                    position: "absolute",
                    bottom: "0.5rem",
                    cursor: "ns-resize",
                    transition: "0.1s ease-in-out width"
                }}
            ></div>
        </div >
    )
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HoursMinimap({
    mode,
    schedule,
    compact = false,
    onChange
}: {
    mode: 'dark' | 'light'
    schedule: Schedule,
    compact?: boolean,
    onChange?: (newSchedule: Schedule) => any
}) {


    const base = mode === 'dark' ? '#000000' : '#ffffff';
    const theme = useTheme();

    const handleHoursStringChange = (newString: string) => {

        if (!onChange) {
            return;
        }

        try {
            const newObject = Schedule.create("Test", "regular", newString,
                schedule.start_date ? dayjs(String(schedule.start_date)) : dayjs(), schedule.end_date ? dayjs(String(schedule.end_date)) : null);

            onChange(newObject);
        }
        catch (err) {
            console.log(err)
        }

        return;
    }

    const doesDayOfWeekExistInFrame = (day: number) => {
        if (!schedule.end_date) {
            // console.log({ day, start_date, end_date, result: "No end" });
            return true;
        }

        if (schedule.end_date.diff(schedule.start_date, 'day') >= 7) {
            return true;
        }

        if (!schedule.start_date) {
            return false;
        }

        if (schedule.end_date.get('day') >= schedule.start_date.get('day')) {
            return day <= schedule.end_date.get('day') && day >= schedule.start_date.get('day');
        }

        return !(day < schedule.start_date.get('day') && day > schedule.end_date.get('day'));
    }

    return (
        <div className="column snug" style={{ height: "fit-content", width: "100%" }}>
            <div className="div flex" style={{ height: compact ? "1rem" : "3rem" }}>
                {!compact && (
                    <div className="column snug" style={{ height: "100%", width: "5rem" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}></Typography>
                    </div>
                )}
                <div className="flex compact2" style={{ width: compact ? "100%" : "calc(100% - 5rem)" }}>
                    {days && days.map(day => (
                        <div key={day} className="column snug center middle" style={{ height: "100%", width: "calc(100% / 7)" }}>
                            {/* <Tooltip title="No Sunday in the date range.">
                            <WarningOutlined color="warning" />
                        </Tooltip> */}
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{day}</Typography>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex" style={{ alignItems: "flex-start", height: compact ? "calc(100% - 1rem) " : "calc(100% - 3rem)" }}>

                {!compact && (
                    <div className="column compact2" style={{ width: "5rem", height: "100%" }}>
                        {segments.map(segment => (
                            <div className="column snug middle" style={{ height: "2.5rem" }} key={segment.label}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{segment.label}</Typography>
                                <Typography variant="caption" sx={{
                                    marginTop: "-0.25rem"
                                }}>{segment.caption}</Typography>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex compact2" style={{ width: compact ? "100%" : "calc(100% - 5rem)", height: "fit-content" }}>
                    {schedule.days.map((day: number, index: number) => {

                        const existsInFrame = doesDayOfWeekExistInFrame(index);

                        return (
                            <div key={`${day}-${index}`} className="column compact2" style={{
                                height: "100%",
                                position: "relative",
                                width: "calc(100% / 7)",
                            }}>
                                {
                                    segments.map(segment => {

                                        return (
                                            <ButtonBase
                                                key={`${day}-${index}-${segment.label}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log("Add hours")
                                                    const theCopy = new Schedule(schedule.eject());


                                                    theCopy.mask({
                                                        start_time: new Chronos(segment.start_time),
                                                        end_time: new Chronos(segment.end_time, false),
                                                        dow: index
                                                    })
                                                    theCopy.as_text = theCopy.to_string();
                                                    if (onChange) {
                                                        onChange(theCopy)
                                                    }
                                                }}
                                                sx={{
                                                    backgroundColor: day === Hours.OPEN ? `${base}25` : day === Hours.CLOSED ? `${base}25` : `${base}25`,
                                                    opacity: existsInFrame ? 1 : 0.25,
                                                    height: "2.5rem",
                                                    borderRadius: "0.5rem",
                                                    width: '100%',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: day === Hours.OPEN ? `${base}10` : day === Hours.CLOSED ? `${base}10` : `${base}10`,
                                                    }
                                                }}>
                                            </ButtonBase>
                                        )
                                    })
                                }
                                <div style={{
                                    "--bg-color": theme.palette.primary.main,
                                    "--text-color": theme.palette.primary.contrastText
                                }}>
                                    {day > Hours.OPEN && (
                                        <RenderHours
                                            key={`${day}-${index}-hours`}
                                            hours={schedule.hours[day - Hours.HOURS_LOCATOR_PREFIX]}
                                            onDelete={({ start_time, end_time }: { start_time: number, end_time: number }) => {
                                                const theCopy = new Schedule(schedule.eject());

                                                theCopy.unmask({
                                                    start_time: new Chronos(start_time),
                                                    end_time: new Chronos(end_time, false),
                                                    dow: index
                                                });
                                                theCopy.as_text = theCopy.to_string();
                                                if (onChange) {
                                                    onChange(theCopy)
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="column" style={{
                padding: '1rem 0'
            }}>
                <div className="flex compact">
                    <StyledDatePicker
                        value={schedule.start_date}
                        onChange={(date) => {
                            if (onChange) {
                                const copy = schedule.eject();
                                copy.start_date = date;
                                onChange(new Schedule(copy))
                            }
                        }}
                        mode={'dark'}
                        label={'Date'}
                        key="event_startDate"
                    />
                    <StyledDatePicker
                        value={schedule.end_date}
                        onChange={(date) => {
                            if (onChange) {
                                const copy = schedule.eject();
                                copy.end_date = date;
                                onChange(new Schedule(copy))
                            }
                        }}
                        mode={'dark'}
                        label={'End Date'}
                        key="event_endDate"
                    />
                </div>
                <div className="flex top compact">
                    <TextField
                        onChange={(e) => handleHoursStringChange(e.target.value)}
                        fullWidth
                        multiline
                        maxRows={7}
                        value={schedule.as_text}
                        variant="standard"
                        size="small"
                />
                    <Button onClick={() => {
                        if (onChange) {
                            onChange(new Schedule())
                        }
                    }}>Clear</Button>
                </div>

            </div>
        </div >
    )
}



const RenderHours = ({
    hours,
    onDelete
}: {
    hours: Hours,
    onDelete: (props: { start_time: number, end_time: number }) => any
}) => {

    const handleDelete = (start: number, end: number) => {
        onDelete({
            start_time: start,
            end_time: end
        })
    }

    if (hours.breaks.length === 0) {

        try {

            return (
                <HoursBox compact={true} start={hours.min.getHMN()} end={hours.max.getHMN()} onDelete={(e: any) => {
                    e.stopPropagation();
                    handleDelete(hours.min.getHMN(), hours.max.getHMN())
                }} />
            )
        }
        catch (err) {
            console.error({
                message: "Error rendering hours box",
                hours
            })
            return null;
        }
    }

    return (
        <>
            <HoursBox start={hours.min.getHMN()} end={hours.breaks[0].getHMN()} onDelete={(e: any) => {
                e.stopPropagation();
                handleDelete(hours.min.getHMN(), hours.breaks[0].getHMN())
            }} />
            <HoursBox start={hours.breaks[hours.breaks.length - 1].getHMN()} end={hours.max.getHMN()} onDelete={(e: any) => {
                e.stopPropagation();
                handleDelete(hours.breaks[hours.breaks.length - 1].getHMN(), hours.max.getHMN())
            }} />

            {hours.breaks.map((item, index) => {
                if (index === 0 || index === hours.breaks.length - 1 || index % 2 === 0) {
                    return null
                }
                return (
                    <HoursBox key={item.print()} start={hours.breaks[index].getHMN()} end={hours.breaks[index + 1].getHMN()} onDelete={(e: any) => {
                        e.stopPropagation();
                        handleDelete(hours.breaks[index].getHMN(), hours.breaks[index + 1].getHMN())
                    }} />
                )
            })}
        </>
    )
}