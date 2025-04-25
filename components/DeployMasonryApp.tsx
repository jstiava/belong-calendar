import { Typography, FormGroup, FormControlLabel, Checkbox, useTheme, FormControl, FormHelperText, Button, TextField, useMediaQuery, Skeleton, CircularProgress } from "@mui/material";
import { Type } from "@/types/globals";
import { Search, CloseOutlined, RestoreOutlined, AccessTime, LocationOnOutlined, CodeOutlined } from "@mui/icons-material";
import { DatePicker, TimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import { Event, Member, MemberFactory } from "@/schema";
import axios, { API } from "@/lib/utils/axios";
import { useSnackbar } from "notistack";
import AccordionCreateModule, {
    AccordionSummaryCreateModule,
    AccordionDetailsCreateModule,
} from '@/components/accordions/AccordionCreateModule';
import MerchantLargeEditCard from "./MerchantLargeEditCard";
import { isNotScheduled, isSingleTimeEvent } from "@/lib/CalendarDays";
import { UseEvents } from "@/lib/global/useEvents";
import { StartViewer } from "@/lib/global/useView";
import BackgroundImage from "./Image";
import { MEDIA_BASE_URI } from "@/lib/useComplexFileDrop";
import { Source_Sans_3 } from "next/font/google";


const ss3 = Source_Sans_3({ subsets: ['latin'] });


const sortByTime = (a: Event, b: Event) => {
    if (a.getMin() && b.getMin()) {
        return a.getMin()!.getHMN() - b.getMin()!.getHMN()
    }
    if (a.getMin()) {
        return -1;
    }
    if (b.getMin()) {
        return 1;
    }

    if (a.date || b.date) {
        return 0;
    }

    return 0;
}

export default function DeployMasonryApp({ source, Events, startViewer, onSubmit, onCancel }: {
    source: Member,
    Events: UseEvents,
    startViewer: StartViewer,
    onSubmit: any,
    onCancel: any
}) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [key, setKey] = useState(0);
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [eventList, setEventList] = useState<Event[] | null>(null);
    const [app, setApp] = useState<any>(null);

    const [name, setName] = useState("New Masonry App");
    const [expanded, setExpanded] = useState('dateTime');
    const [updateOn, setUpdateOn] = useState('dynamic');

    let imgRefs = [];

    const isSM = useMediaQuery(theme.breakpoints.down('sm'));
    const isMD = useMediaQuery(theme.breakpoints.down('md'));

    const handleAccordionChange = (key: string) => {
        return expanded === key ? setExpanded('') : setExpanded(key);
    };


    const deploy = async () => {

        if (!eventList) {
            enqueueSnackbar("Did not publish", {
                variant: "error"
            })
            return;
        }

        const ejectedList = eventList.map(x => x.eject());

        const data = {
            name,
            events: ejectedList,
            source: source.eject(),
            source_id: source.id(),
            last_updated_on: new Date(),
            created_on: new Date(),
            updateOn
        }



        await axios.post(API.DEPLOY_APP, {
            source: MemberFactory.getToken(source),
            app: data
        })
            .then(res => {
                if (res.data.uuid) {
                    console.log(res.data.uuid);
                    enqueueSnackbar("Published", {
                        variant: 'success'
                    });
                }
                setApp({
                    ...data,
                    uuid: res.data.uuid
                })
            })
            .catch(err => {
                enqueueSnackbar("Did not publish", {
                    variant: "error"
                })
            })


        return;
    }


    const init = () => {
        if (!Events.events) {
            return;
        }
        const theEvents = [...Events.events];
        theEvents.sort(sortByTime).reverse();
        setEventList(theEvents);
    }

    useEffect(() => {
        init();
    }, [Events.events]);


    return (
        <div className={`${isMD ? 'column' : 'flex'} top middle`} style={{
            position: "relative",
            height: 'fit-content',
            marginTop: "5rem",
            padding: "1rem",
            width: "100%"
        }}>

            <div className="column" style={{ width: isMD ? "100%" : "60%", marginBottom: "6rem", maxWidth: "45rem" }}>
                <div className="column" style={{ marginBottom: '5rem' }}>
                    {isSM && (
                        <TextField
                            label={`App Name`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="standard"
                            sx={{ width: '100%' }}
                            inputProps={{
                                style: {
                                    fontSize: '2rem',
                                    lineHeight: '2rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.15px',
                                },
                            }}
                            color="primary"
                            key="item_name"
                            name="name"
                            hiddenLabel
                            multiline
                            maxRows={4}
                            spellCheck={false}
                            placeholder="New Masonry App"
                        />
                    )}

                </div>

                {!eventList ? (

                    <>
                        <div
                            className="column"
                            style={{
                                maxWidth: "100%",
                                width: "70rem",
                                paddingTop: "12rem",
                            }}>
                            <div
                                className="flex top"
                            >
                                <div className="column snug"
                                    key={1}
                                    style={{
                                        position: "relative"
                                    }}>
                                    <Skeleton variant="rounded" width={400} height={60} />
                                    <Skeleton variant="circular" width={40} height={40} sx={{
                                        position: "absolute",
                                        top: 60,
                                        right: "1rem"
                                    }} />
                                    <Skeleton variant="rounded" width={400} height={60} />
                                </div>
                                <div className="column snug"
                                    key={2}
                                    style={{
                                        position: "relative"
                                    }}>
                                    <Skeleton variant="rounded" width={400} height={60} />
                                    <Skeleton variant="circular" width={40} height={40} sx={{
                                        position: "absolute",
                                        top: 60,
                                        right: "1rem"
                                    }} />
                                    <Skeleton variant="rounded" width={400} height={90} />
                                </div>
                                <div className="column snug"
                                    key={3}
                                    style={{
                                        position: "relative"
                                    }}>
                                    <Skeleton variant="rounded" width={400} height={60} />
                                    <Skeleton variant="circular" width={40} height={40} sx={{
                                        position: "absolute",
                                        top: 60,
                                        right: "1rem"
                                    }} />
                                    <Skeleton variant="rounded" width={400} height={70} />
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <>

                        <div className="flex between">

                            <Typography variant="h6" style={{ marginBottom: "2rem" }}>
                                Preview
                            </Typography>
                            <div className="flex fit compact">
                                <Button onClick={() => deploy()}>Deploy</Button>
                            </div>
                        </div>
                        {app && (
                            <div className="column compact">
                                <TextField
                                    value={`<script>
                         function onFrameLoad() {
                             console.log('Frame Loaded');
                             const iframe = document.getElementById('belongFrame');
             
                             iframe.addEventListener('click', (event) => {
                                 event.preventDefault(); 
                                 console.log(event);
                             });
                         };
                     </script>
                     <div style="pointer events:none">
                     <iframe 
                     id="belongFrame"
                     onload="onFrameLoad()"
               src="https://belong-iframe-react.vercel.app/${app.uuid}"
               width="100%" 
               height="1000"
               style="border: none;"
             ></iframe>
             </div>`}
                                />
                                <Button startIcon={<CodeOutlined />} onClick={async () => {
                                    navigator.clipboard
                                        .writeText(`<script>
                         function onFrameLoad() {
                             console.log('Frame Loaded');
                             const iframe = document.getElementById('belongFrame');
             
                             iframe.addEventListener('click', (event) => {
                                 event.preventDefault(); 
                                 console.log(event);
                             });
                         };
                     </script>
                     <div style="pointer events:none">
                     <iframe 
                     id="belongFrame"
                     onload="onFrameLoad()"
               src="https://belong-iframe-react.vercel.app/${app.uuid}"
               width="100%" 
               height="1000"
               style="border: none;"
             ></iframe>
             </div>`)
                                        .then(() => {
                                            enqueueSnackbar("Copied to Clipboard.", {
                                                variant: "success"
                                            })
                                        })
                                        .catch((err) => {
                                            enqueueSnackbar("Could not copy code to clipboard.", {
                                                variant: "error"
                                            })
                                        });
                                }}>
                                    Copy
                                </Button>
                            </div>
                        )}
                        <Masonry
                            key={`${key}_open`}
                            className="flex between top my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                            breakpointCols={{
                                default: 2,
                                1300: 2,
                                1000: 2,
                                600: 1,
                            }}
                        >
                            {eventList.map((event: Event) => {
                                if (isSingleTimeEvent(event)) {
                                    return (
                                        <div
                                            className="column"
                                            key={event.id()}
                                            style={{
                                                height: 'fit-content',
                                                backgroundColor: event.theme_color || theme.palette.divider,
                                                color: event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.text.primary,
                                                borderRadius: "0.5rem",
                                                overflow: 'hidden',
                                                fontFamily: [ss3.style.fontFamily,
                                                    'sans-serif',
                                                ].join(',')
                                            }}
                                        >
                                            {event.cover_img && (
                                                <BackgroundImage
                                                    url={`${MEDIA_BASE_URI}/${event.cover_img.path}`}
                                                    width={"100%"}
                                                    height={"10rem"}
                                                />
                                            )}
                                            <div className="column compact" style={{
                                                padding: "1rem 1.5rem"
                                            }}>
                                                <div className="column compact">
                                                    <Typography key={event.id()} sx={{
                                                        fontFamily: 'inherit',
                                                        fontWeight: 700,
                                                        fontSize: "1.25rem",
                                                        lineHeight: "115%"
                                                    }}>{event.name}</Typography>
                                                    {isSingleTimeEvent(event) && (
                                                        <Typography sx={{
                                                            fontFamily: 'inherit',
                                                            fontSize: "1rem",
                                                            lineHeight: "115%"
                                                        }}>{event.date.format("dddd, MMMM D")}</Typography>
                                                    )}
                                                    {event.location_name && (
                                                        <div className="flex compact">
                                                            <LocationOnOutlined />
                                                            <Typography sx={{
                                                                fontFamily: 'inherit',
                                                                fontSize: "1rem",
                                                                lineHeight: "115%"
                                                            }}>{event.location_name}</Typography>
                                                        </div>
                                                    )}
                                                </div>
                                                {(event && event.children) && event.children.some(e => e.link) && (
                                                    (() => {
                                                        const theLink = event.children.find(e => e.link != null);

                                                        if (!theLink || !theLink.link) {
                                                            return null;
                                                        }

                                                        return (
                                                            <Button
                                                                variant={'flipped'}
                                                                size="large"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    textTransform: "uppercase",
                                                                    height: "2.75rem",
                                                                    marginTop: "1rem",
                                                                    color: event.theme_color
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(String(theLink.link), '_blank')
                                                                }}
                                                            >
                                                                {theLink.name}
                                                            </Button>
                                                        )
                                                    })()
                                                )}
                                                {!event.cover_img && event.metadata.description && (
                                                    <Typography sx={{
                                                        fontFamily: 'inherit',
                                                        fontSize: "1rem",
                                                        lineHeight: "115%"
                                                    }}>{event.metadata.description}</Typography>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                                if (!isNotScheduled(event)) {
                                    return (
                                        <></>
                                    )
                                }
                                return null;
                            })}
                        </Masonry>
                    </>
                )}
            </div>

        </div>
    )
}