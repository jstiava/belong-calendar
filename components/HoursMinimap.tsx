"use client"
import Chronos from "@/lib/utils/chronos";
import { Hours } from "@/lib/utils/medici"
import { Schedule } from "@/schema"
import { CloseOutlined, RemoveOutlined, WarningOutlined } from "@mui/icons-material";
import { Box, Button, ButtonBase, IconButton, Popover, Popper, TextField, ThemeProvider, Tooltip, Typography, useTheme } from "@mui/material"
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
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
    onDelete,
    onAdd
}: {
    start: number,
    end: number,
    compact?: boolean,
    onDelete: any,
    onAdd: (present: { start_time: Chronos, end_time: Chronos }) => any
}) {


    const theme = useTheme();
    const [isHovering, setIsHovering] = useState(false);


    const oneTwentyFourthRef = useRef(0);
    const [top, setTop] = useState<string | null>(null)
    const [height, setHeight] = useState<string | null>(null);
    const boxRef = useRef<any | null>(null);
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const startHeight = useRef(0);
    const startTop = useRef(0);
    const isDraggingTop = useRef<boolean>(false);
    const labelsRef = useRef<{
        start: Chronos,
        end: Chronos
    } | null>(null);

    const getBoxHeight = () => {
        if (boxRef.current) {

            if (oneTwentyFourthRef.current) {
                return oneTwentyFourthRef.current;
            }

            const boxWithHeight = Number(boxRef.current.parentElement.parentElement.offsetHeight);
            const result = Number((boxWithHeight / 24).toFixed(3));
            oneTwentyFourthRef.current = result;
            console.log({
                message: oneTwentyFourthRef.current.toFixed(3),
                boxWithHeight
            });

            return result;
        }
        return 0;
    }

    const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        onMouseMove(touch)
    }

    const onMouseDown = (e: any, handle: string) => {

        if (!boxRef.current) {
            return;
        }

        isDraggingRef.current = true;
        setIsDragging(true)
        dragStartY.current = e.clientY;
        startTop.current = boxRef.current.offsetTop;
        startHeight.current = boxRef.current.offsetHeight;
        isDraggingTop.current = handle === 'top';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onMouseUp);

    };


    const onMouseMove = (e: any) => {
        if (!isDraggingRef.current || !boxRef.current || !labelsRef.current) return;

        if (isDraggingTop.current) {
            const deltaY = e.clientY - dragStartY.current;
            const newTop = startTop.current + deltaY;
            const boxHeight = getBoxHeight();
            const newHeight = startHeight.current - deltaY;
            const startTimeDiff = new Chronos(start).add(deltaY / boxHeight).truncate(4);

            if (startTimeDiff.isBefore(new Chronos(2))) {
                return;
            }
            else {
                setTop(`${newTop}px`);
                setHeight(`${newHeight}px`);
                labelsRef.current = {
                    start: new Chronos(Math.max(2, startTimeDiff.getHMN())),
                    end: labelsRef.current.end
                };
            }


        }
        else {
            const deltaY = e.clientY - dragStartY.current;
            const newHeight = startHeight.current + deltaY;

            const endTimeDiff = new Chronos(end).add(deltaY / getBoxHeight(), false).truncate(4);

            if (endTimeDiff.isAfter(new Chronos(26, false))) {
                return;
            }
            else {
                setHeight(`${newHeight}px`);
                labelsRef.current = {
                    start: labelsRef.current.start,
                    end: new Chronos(Math.min(26, endTimeDiff.getHMN())),
                };
            }
        }

    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false)
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onMouseUp);

        if (!labelsRef.current) {
            return;
        }

        onAdd({
            start_time: labelsRef.current.start,
            end_time: labelsRef.current.end
        });

        init();
    };

    const init = () => {
        if (!start || !end) {
            return;
        }

        /**
         * value * (1 hour) - (starts at 2am)
         */
        setTop(`${100 * ((start * (1 / 24)) - 2 / 24)}%`)
        setHeight(`${100 * ((end - start) * (1 / 24))}%`);

        labelsRef.current = {
            start: new Chronos(start),
            end: new Chronos(end)
        };
    }



    useEffect(() => {
        getBoxHeight();
    }, [])

    useEffect(() => {

        if (!start || !end) {
            return;
        }
        init();


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end])

    if (!top || !height) {
        return <></>
    }

    return (
        <>
            {isDragging && labelsRef.current && (
                <>
                    <Popper
                        disablePortal
                        open={true}
                        anchorEl={boxRef.current}
                        placement="top"
                        sx={{
                            padding: "0.25rem",
                        }}

                    >
                        <Typography sx={{
                            fontSize: "0.75rem",
                            backgroundColor: theme.palette.background.paper,
                            padding: "0.25rem",
                            borderRadius: "0.25rem",
                            whiteSpace: 'nowrap'
                        }}>{labelsRef.current.start.print()}</Typography>
                    </Popper>
                    <Popper
                        disablePortal
                        open={true}
                        anchorEl={boxRef.current}
                        placement="bottom"
                        sx={{
                            padding: "0.25rem",
                            width: "fit-content"
                        }}
                    >
                        <Typography sx={{
                            fontSize: "0.75rem",
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: "0.25rem",
                            padding: "0.25rem",
                            whiteSpace: 'nowrap'
                        }}>{labelsRef.current.end.print()}</Typography>
                    </Popper>
                </>
            )}
            <div
                ref={boxRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="column snug between center middle"
                style={{
                    position: "absolute",
                    top: top,
                    backgroundColor: isDraggingRef.current ? 'transparent' : `var(--bg-color)`,
                    width: "100%",
                    height: height,
                    borderRadius: "0.5rem",
                    border: `0.25rem solid var(--bg-color)`,
                    padding: "0.5rem 0",
                    cursor: 'pointer',
                    transition: "0.05s ease-in background"
                }}>
                {isHovering && !isDraggingRef.current && (
                    <IconButton onClick={onDelete}>
                        <CloseOutlined sx={{
                            fontSize: "1rem",
                            color: 'var(--text-color)'
                        }} />
                    </IconButton>
                )}
                <div
                    onMouseDown={(e) => onMouseDown(e, 'top')}
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        onMouseDown(touch, 'top')
                    }}
                    className="flex center middle snug"
                    style={{
                        position: "absolute",
                        top: 0,
                        cursor: "ns-resize",
                        width: "100%",
                        height: "1rem"
                    }}>

                    <div className="drag-handle top"
                        style={{
                            height: "0.175rem",
                            borderRadius: "0.5rem",
                            backgroundColor: `var(--text-color)`,
                            width: isHovering ? "70%" : "50%",
                            transition: "0.1s ease-in-out width"
                        }}></div>
                </div>
                <div
                    onMouseDown={(e) => onMouseDown(e, 'bottom')}
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        onMouseDown(touch, 'bottom')
                    }}
                    className="flex center middle snug"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        cursor: "ns-resize",
                        width: "100%",
                        height: "1rem"
                    }}>

                    <div className="drag-handle top"
                        style={{
                            height: "0.175rem",
                            borderRadius: "0.5rem",
                            backgroundColor: `var(--text-color)`,
                            width: isHovering ? "70%" : "50%",
                            transition: "0.1s ease-in-out width"
                        }}></div>
                </div>
            </div >

        </>

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
                                    height: "100%",
                                    width: "100%",
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
                                                console.log({
                                                    original: schedule,
                                                    start_time,
                                                    end_time,
                                                    dow: index,
                                                    theCopy,
                                                    message: "onDelete"
                                                })
                                                if (onChange) {
                                                    onChange(theCopy)
                                                }
                                            }}

                                            onAdd={({ past, present }: {
                                                past: { start_time: number, end_time: number },
                                                present: { start_time: number, end_time: number }
                                            }) => {
                                                const theCopy = new Schedule(schedule.eject());
                                                theCopy.unmask({
                                                    start_time: new Chronos(past.start_time),
                                                    end_time: new Chronos(past.end_time, false),
                                                    dow: index
                                                });
                                                theCopy.mask({
                                                    start_time: new Chronos(present.start_time),
                                                    end_time: new Chronos(present.end_time, false),
                                                    dow: index
                                                });
                                                theCopy.as_text = theCopy.to_string();
                                                console.log({
                                                    original: schedule,
                                                    past,
                                                    present,
                                                    dow: index,
                                                    theCopy,
                                                    message: "onAdd"
                                                })
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

                <TextField
                    onChange={(e) => {
                        if (onChange) {
                            const copy = schedule.eject();
                            copy.name = e.target.value;
                            onChange(new Schedule(copy))
                        }
                    }}
                    fullWidth
                    label="Name"
                    value={schedule.name}
                    variant="standard"
                    size="small"
                />
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
                        mode={theme.palette.mode === 'dark' ? 'light' : 'dark'}
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
                        mode={theme.palette.mode === 'dark' ? 'light' : 'dark'}
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


export interface HoursInterchange {
    past: { start_time: number, end_time: number },
    present: { start_time: number, end_time: number }
}

const RenderHours = ({
    hours,
    onDelete,
    onAdd
}: {
    hours: Hours,
    onDelete: (props: { start_time: number, end_time: number }) => any,
    onAdd: (props: HoursInterchange) => any
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
                <HoursBox compact={true} start={hours.min.getHMN()} end={hours.max.getHMN()}
                    onAdd={(present: any) => {
                        onAdd({
                            past: {
                                start_time: hours.min.getHMN(),
                                end_time: hours.max.getHMN()
                            },
                            present: {
                                start_time: present.start_time.getHMN(),
                                end_time: present.end_time.getHMN()
                            }
                        });
                    }}
                    onDelete={(e: any) => {
                        e.stopPropagation();
                        handleDelete(hours.min.getHMN(), hours.max.getHMN())
                    }}
                />
            )
        }
        catch (err) {
            console.log({
                message: "Error rendering hours box",
                hours
            })
            return <></>;
        }
    }

    return (
        <>
            <HoursBox
                start={hours.min.getHMN()}
                end={hours.breaks[0].getHMN()}
                onAdd={(present: any) => {
                    onAdd({
                        past: {
                            start_time: hours.min.getHMN(),
                            end_time: hours.breaks[0].getHMN()
                        },
                        present: {
                            start_time: present.start_time.getHMN(),
                            end_time: present.end_time.getHMN()
                        }
                    });
                }}
                onDelete={(e: any) => {
                    e.stopPropagation();
                    handleDelete(hours.min.getHMN(), hours.breaks[0].getHMN())
                }} />
            <HoursBox start={hours.breaks[hours.breaks.length - 1].getHMN()} end={hours.max.getHMN()}
                onAdd={(present: any) => {
                    onAdd({
                        past: {
                            start_time: hours.breaks[hours.breaks.length - 1].getHMN(),
                            end_time: hours.max.getHMN()
                        },
                        present: {
                            start_time: present.start_time.getHMN(),
                            end_time: present.end_time.getHMN()
                        }
                    });
                }}
                onDelete={(e: any) => {
                    e.stopPropagation();
                    handleDelete(hours.breaks[hours.breaks.length - 1].getHMN(), hours.max.getHMN())
                }} />

            {hours.breaks.map((item, index) => {
                if (index === 0 || index === hours.breaks.length - 1 || index % 2 === 0) {
                    return null
                }
                return (
                    <HoursBox key={item.print()} start={hours.breaks[index].getHMN()}
                        end={hours.breaks[index + 1].getHMN()}
                        onAdd={(present: any) => {
                            onAdd({
                                past: {
                                    start_time: hours.breaks[index].getHMN(),
                                    end_time: hours.breaks[index + 1].getHMN()
                                },
                                present: {
                                    start_time: present.start_time.getHMN(),
                                    end_time: present.end_time.getHMN()
                                }
                            });
                        }}
                        onDelete={(e: any) => {
                            e.stopPropagation();
                            handleDelete(hours.breaks[index].getHMN(), hours.breaks[index + 1].getHMN())
                        }} />
                )
            })}
        </>
    )
}