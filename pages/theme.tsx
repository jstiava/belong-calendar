import ColorPaletteSelector from "@/components/accordions/ColorPaletteSelector";
import StyledDatePicker from "@/components/StyledDatePicker";
import LargeTextField from "@/components/LargeTextField";
import { Button, FormControl, IconButton, InputLabel, MenuItem, Select, ThemeProvider, Typography, createTheme, lighten } from "@mui/material";
import { Source_Sans_3 } from 'next/font/google';
import { ChangeEvent, useRef, useState } from "react";
import StyledTimePicker from "@/components/TimePicker";
import { AddOutlined, Lock } from "@mui/icons-material";
import StyledWeekPicker from "@/components/calendar/WeekPicker";
import { AppPageProps, Mode, Type } from "@/types/globals";
import { EventData, Events, Group, Profile, Schedule } from "@/schema";
import Chronos from "@/lib/utils/chronos";
import dayjs from "@/lib/utils/dayjs";
import { Dayjs } from "dayjs";
import HoursMinimap from "@/components/HoursMinimap";
import useCreator from "@/lib/global/useCreate";
import useBase from "@/lib/global/useBase";
import useSession from "@/lib/global/useSession";
import useEvents from "@/lib/global/useEvents";
import useCalendar from "@/lib/useCalendar";

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


export default function ThemePage(props: AppPageProps) {

    const [color, setColor] = useState("#0fd9c1");
    const Calendar = props.Session.Calendar;
    const [item, setItem] = useState<any>({});

    const [timeA, setTimeA] = useState<Dayjs | null>(dayjs());
    const [timeB, setTimeB] = useState<Dayjs | null>(dayjs());
    const [schedule, setSchedule] = useState<Schedule | null>(new Schedule());

    const Base = useBase(source, props.Session, () => { return; }, false);

    const timeBInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (eventOrName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value: any) => {
        if (typeof eventOrName === "string") {
            setItem((prev: any) => ({
                ...prev,
                [eventOrName]: value
            }));
            return;
        }
        if (!eventOrName.target.name) {
            return;
        }
        setItem((prev: any) => ({
            ...prev,
            [eventOrName.target.name]: value
        }));
    }

    const lightTheme = createTheme({
        palette: {
            primary: {
                main: color,
            },
            secondary: {
                main: "#ffffff",
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'capitalize',
                        fontWeight: 700,
                        variants: [
                            {
                                props: { variant: "outlined", color: "error" },
                                style: {
                                    '&:hover': {
                                        backgroundColor: "#FCEEEE"
                                    },
                                    backgroundColor: "#F9DDDD"
                                }
                            },
                            {
                                props: { variant: "text", color: "error" },
                                style: {
                                    '&:hover': {
                                        backgroundColor: "#FCEEEE"
                                    },
                                    backgroundColor: "#F9DDDD"
                                }
                            },
                            {
                                props: { color: 'light' },
                                style: {
                                    '&:hover': {
                                        backgroundColor: lighten("#0fd9c1", 0.8) || "#ffffff"
                                    },
                                    backgroundColor: lighten("#0fd9c1", 0.9) || "#ffffff"
                                }
                            },
                            {
                                props: { variant: 'invert' },
                                style: {
                                    '&:hover': {
                                        backgroundColor: lighten("#000000", 0.2),
                                        color
                                    },
                                    backgroundColor: '#000000',
                                    color: color
                                }
                            },
                            {
                                props: { variant: 'invert', disabled: true },
                                style: {
                                    '&:hover': {
                                        backgroundColor: lighten("#000000", 0.2),
                                        color
                                    },
                                    backgroundColor: '#00000025',
                                    color: '#000000',
                                }
                            }
                        ]
                    }
                },
            },
            MuiPopper: {
                styleOverrides: {
                    root: {
                        borderRadius: '0.25rem',
                    },
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: "0.5rem"
                    }
                }
            }
        },
        typography: {
            h3: {
                fontWeight: 800
            },
            h4: {
                fontWeight: 800
            },
            h5: {
                fontWeight: 700
            },
            h6: {
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: "0.015rem"
            },
            fontFamily: [
                sora.style.fontFamily,
                'sans-serif',
            ].join(','),
        },
        breakpoints: {
            values: {
                xs: 425,
                sm: 768,
                md: 1024,
                lg: 1440,
                xl: 1920
            },
        },
    });

    if (!color) {
        return null;
    }

    if (!Calendar || !Calendar.days || Calendar.days.length === 0) {
        return null;
    }


    return (
        <div id="content"
            className="column"
            style={{
                marginTop: "10rem",
                padding: "1rem"
            }}>

            <ColorPaletteSelector
                item={{
                    theme_color: color
                }}
                handleChange={(key: string, value: string) => {
                    setColor(value);
                }}
            />

            <ThemeProvider theme={lightTheme}>
                <div className="column snug">
                    <Typography variant="h1">Heading 1</Typography>
                    <Typography variant="h2">Heading 2</Typography>
                    <Typography variant="h3">Heading 3</Typography>
                    <Typography variant="h4">Heading 4</Typography>
                    <Typography variant="h5">Heading 5</Typography>
                    <Typography variant="h6">Heading 6</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</Typography>
                </div>

                <div className="flex" style={{
                    "--bg-color": lightTheme.palette.background.paper,
                    "--text-color": lightTheme.palette.text.primary,
                }}>
                    <div className="flex compact">
                        <div className="column compact" style={{
                            padding: '5rem 3rem',
                            height: 'fit-content',
                            width: "35rem",
                        }}>
                            <LargeTextField
                                label={`New Event Name`}
                                variant="standard"
                                key="item_name"
                                name="name"
                                hiddenLabel
                                multiline
                                maxRows={4}
                                // value={newItem && newItem.name}
                                spellCheck={false}
                                // onChange={(e) => handleChange(e, e.target.value)}
                                placeholder="Event Name"
                            />
                            <StyledDatePicker
                                mode="dark"
                                format="ddd, MMM D, YYYY"
                                label={'Date'}
                                key="event_startDate"
                            />
                            <StyledDatePicker
                                mode="dark"
                                format="ddd, MMM D, YYYY"
                                label={'End Date'}
                                key="event_endDate"
                                value={null}
                                disabled

                            />
                            <div className="flex compact">
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="dark"
                                    label={'Start'}
                                    value={item.start_time ? Events.dayjs(item.date || dayjs().yyyymmdd(), new Chronos(Number(item.start_time))) : null}
                                    onChange={(date) => handleChange("start_time", date?.toLocalChronos().getHMN())}
                                    sx={{
                                        width: "9rem"
                                    }}
                                />
                                <div className="column snug fit" style={{
                                    position: 'relative',
                                    width: "2rem"
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        width: "3rem",
                                        height: "2px",
                                        backgroundColor: 'var(--text-color)',
                                        opacity: 0.75,
                                        top: "1rem",
                                        left: "-0.5rem",
                                    }}></div>
                                    <IconButton sx={{
                                        color: `var(--text-color)`,
                                        backgroundColor: `var(--bg-color)`,
                                        '&:hover': {
                                            backgroundColor: `var(--bg-color)`
                                        }
                                    }} >
                                        <Lock sx={{
                                            fontSize: "0.9rem",
                                        }} />
                                    </IconButton>
                                    <Typography variant="caption" sx={{
                                        marginTop: "-0.5rem",
                                        zIndex: 1,
                                        width: "fit-content",
                                        whiteSpace: "nowrap"
                                    }}>1 hour</Typography>
                                </div>
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="dark"
                                    label={'End'}
                                    value={item.end_time ? Events.dayjs(item.date || dayjs().yyyymmdd(), new Chronos(Number(item.end_time))) : null}
                                    onChange={(date) => handleChange("end_time", date?.toLocalChronos().getHMN())}
                                    sx={{
                                        width: "11.5rem"
                                    }}
                                // shouldDisableTime={shouldDisableTime}
                                />
                            </div>
                            <StyledWeekPicker mode="dark" Calendar={Calendar} />
                            <Button onClick={() => {
                                Base.Creator.startCreator(Type.Event, Mode.Create)
                            }}>Start</Button>
                            <div style={{
                                width: '25rem'
                            }}>
                                {schedule && (
                                    <>
                                        <HoursMinimap
                                            mode="dark"
                                            schedule={schedule}
                                            start_date={item.date ? dayjs(item.date) : null}
                                            end_date={item.end_date ? dayjs(item.end_date) : null}
                                            onChange={(newSch) => setSchedule(newSch)}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="column" style={{
                                border: `0.1rem solid ${lightTheme.palette.divider}`,
                                borderRadius: "0.25rem",
                                padding: "0.5rem"
                            }}>
                                <div className="flex compact2">

                                    <FormControl sx={{
                                        width: "15rem"
                                    }}>
                                        <InputLabel id="demo-simple-select-label">Field</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label="Field"
                                            size="small"
                                        >
                                            <MenuItem value={10}>Aspect Type</MenuItem>
                                            <MenuItem value={20}>Event Time</MenuItem>
                                            <MenuItem value={30}>Object Id</MenuItem>
                                            <MenuItem value={30}>Object Type</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{
                                        width: "10rem"
                                    }}>
                                        <InputLabel id="demo-simple-select-label">Op</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label="Op"
                                             size="small"
                                        >
                                            <MenuItem value={10}>Equals</MenuItem>
                                            <MenuItem value={30}>Greater Than</MenuItem>
                                            <MenuItem value={30}>Less Than</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{
                                        width: "10rem"
                                    }}>
                                        <InputLabel id="demo-simple-select-label">Value</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label="Value"
                                             size="small"
                                        >
                                            <MenuItem value={10}>Equals</MenuItem>
                                            <MenuItem value={30}>Greater Than</MenuItem>
                                            <MenuItem value={30}>Less Than</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <IconButton>
                                    <AddOutlined />
                                </IconButton>
                            </div>
                        </div>
                        <div
                            className="column compact"
                            style={{
                                padding: '5rem 3rem',
                                height: 'fit-content',
                                "--bg-color": lightTheme.palette.primary.main,
                                "--text-color": lightTheme.palette.primary.contrastText,
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-color)",
                                width: "30rem"
                            }}>
                            <LargeTextField
                                label={`New Event Name`}
                                variant="standard"
                                key="item_name"
                                name="name"
                                hiddenLabel
                                multiline
                                maxRows={4}
                                // value={newItem && newItem.name}
                                spellCheck={false}
                                // onChange={(e) => handleChange(e, e.target.value)}
                                placeholder="Event Name"
                            />
                            <StyledDatePicker
                                mode="dark"
                                format="ddd, MMM D, YYYY"
                                label={'Date'}
                                key="event_startDate"
                            />
                            <StyledDatePicker
                                mode="dark"
                                format="ddd, MMM D, YYYY"
                                label={'End Date'}
                                key="event_endDate"
                                value={null}
                                disabled
                            />
                            <div className="flex compact">
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="dark"
                                    label={'Start'}
                                    sx={{
                                        width: "9rem"
                                    }}
                                />
                                <div className="column snug fit" style={{
                                    position: 'relative',
                                    width: "2rem"
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        width: "3rem",
                                        height: "2px",
                                        backgroundColor: 'var(--text-color)',
                                        opacity: 0.5,
                                        top: "1rem",
                                        left: "-0.5rem",
                                    }}></div>
                                    <IconButton sx={{
                                        backgroundColor: `var(--bg-color)`,
                                        '&:hover': {
                                            backgroundColor: `var(--bg-color)`
                                        }
                                    }} >
                                        <Lock sx={{
                                            fontSize: "0.9rem",
                                        }} />
                                    </IconButton>
                                    <Typography variant="caption" sx={{
                                        marginTop: "-0.5rem",
                                        zIndex: 1,
                                        width: "fit-content",
                                        whiteSpace: "nowrap"
                                    }}>1 hour</Typography>
                                </div>
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="dark"
                                    label={'End'}
                                    sx={{
                                        width: "11.5rem"
                                    }}
                                // shouldDisableTime={shouldDisableTime}
                                />
                            </div>
                            <StyledWeekPicker mode="dark" Calendar={Calendar} />


                            <div>
                                {schedule && (
                                    <HoursMinimap
                                        mode="dark"
                                        schedule={schedule}
                                        start_date={item.date ? dayjs(item.date) : null}
                                        end_date={item.end_date ? dayjs(item.end_date) : null}
                                        onChange={(newSch) => setSchedule(newSch)}
                                    />
                                )}
                            </div>

                        </div>

                        <div
                            className="column compact"
                            style={{
                                padding: '5rem 3rem',
                                height: 'fit-content',
                                "--bg-color": lightTheme.palette.primary.contrastText,
                                "--text-color": lightTheme.palette.primary.main,
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-color)",
                                width: "30rem"
                            }}>
                            <LargeTextField
                                label={`New Event Name`}
                                variant="standard"
                                key="item_name"
                                name="name"
                                hiddenLabel
                                multiline
                                maxRows={4}
                                // value={newItem && newItem.name}
                                spellCheck={false}
                                // onChange={(e) => handleChange(e, e.target.value)}
                                placeholder="Event Name"
                            />
                            <StyledDatePicker
                                mode="light"
                                format="ddd, MMM D, YYYY"
                                label={'Date'}
                                key="event_startDate"
                            />
                            <StyledDatePicker
                                mode="light"
                                format="ddd, MMM D, YYYY"
                                label={'End Date'}
                                key="event_endDate"
                                value={null}
                                disabled
                            />
                            <div className="flex compact">
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="light"
                                    label={'Start'}
                                    sx={{
                                        width: "9rem"
                                    }}
                                />
                                <div className="column snug fit" style={{
                                    position: 'relative',
                                    width: "2rem"
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        width: "3rem",
                                        height: "2px",
                                        backgroundColor: 'var(--text-color)',
                                        opacity: 0.5,
                                        top: "1rem",
                                        left: "-0.5rem",
                                    }}></div>
                                    <IconButton sx={{
                                        backgroundColor: `var(--bg-color)`,
                                        color: 'var(--text-color)',
                                        '&:hover': {
                                            backgroundColor: `var(--bg-color)`
                                        }
                                    }} >
                                        <Lock sx={{
                                            fontSize: "0.9rem",
                                        }} />
                                    </IconButton>
                                    <Typography variant="caption" sx={{
                                        marginTop: "-0.5rem",
                                        zIndex: 1,
                                        width: "fit-content",
                                        whiteSpace: "nowrap"
                                    }}>1 hour</Typography>
                                </div>
                                <StyledTimePicker
                                    format='h:mm A'
                                    mode="light"
                                    label={'End'}
                                    sx={{
                                        width: "11.5rem"
                                    }}
                                // shouldDisableTime={shouldDisableTime}
                                />
                            </div>
                            <StyledWeekPicker mode="light" Calendar={Calendar} />
                            <div>
                                {schedule && (
                                    <HoursMinimap
                                        mode="light"
                                        schedule={schedule}
                                        start_date={item.date ? dayjs(item.date) : null}
                                        end_date={item.end_date ? dayjs(item.end_date) : null}
                                        onChange={(newSch) => setSchedule(newSch)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>


                </div>
                {Base.Creator.CreateForm}
            </ThemeProvider>
        </div>
    )
}