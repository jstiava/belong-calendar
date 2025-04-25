
import { MouseEvent, useState, useEffect, CSSProperties, forwardRef, AnchorHTMLAttributes } from 'react';
import { AccessTime, DateRangeOutlined, EventOutlined, LocationOnOutlined, RemoveCircleOutline } from "@mui/icons-material";
import { alpha, Button, ButtonBase, ButtonProps, Checkbox, createTheme, darken, FormControl, FormControlLabel, IconButton, lighten, SxProps, Theme, ThemeProvider, Tooltip, Typography, useTheme } from "@mui/material";
import { Event, Schedule } from '@/schema';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import { BackgroundImageGallery, PortraitImage } from './Image';
import MerchantChildCard from './MerchantChildCard';
import { StartViewer } from '@/lib/global/useView';
import { Type } from '@/types/globals';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';
import MerchantChildEditCard from './MerchantChildEditCard';

interface MerchantLargeCardProps extends ButtonProps {
    index: number;
    item: Event;
    onClick?: (e: MouseEvent) => any;
    startViewer: StartViewer;
    hideIfClosed?: boolean,
    hideIfOpen?: boolean;
    forceOpen?: boolean;
    style?: any;
    dateTime?: Dayjs;
    onUncheck: (x: Event, remove?: boolean) => void;
}

const MerchantLargeEditCard = forwardRef<HTMLButtonElement, MerchantLargeCardProps>(({ index, item, onClick, startViewer, hideIfClosed = false, hideIfOpen = false, forceOpen = false, style = {}, dateTime = dayjs(), onUncheck }, ref) => {

    const theme = useTheme();

    const [nextInstance, setNextInstance] = useState(null);

    const [schedule, setSchedule] = useState<Schedule | null>(null);

    const [merchants, setMerchants] = useState(null);
    const [noneAreOpen, setNoneAreOpen] = useState(false);
    const [links, setLinks] = useState(null);


    const handleChildSelect = (x: Event, remove: boolean = false) => {
        const newItem = new Event(item.eject());
        newItem.children = newItem.children.filter(a => a.id() != x.id());
        onUncheck(newItem);
    }

    useEffect(() => {
        const activeSchedule = item.getSchedulesInFrame(dateTime, dateTime.toLocalChronos());
        if (!activeSchedule) {
            return;
        }
        console.log(activeSchedule[0]);
        setSchedule(activeSchedule.length > 0 ? activeSchedule[0] : null);


        let children = item.children;

        if (!children) {
            setMerchants([]);
            // setPrograms([]);
            return;
        }

        let rnNoneAreOpen = true;

        let links = [];
        let filtered = [];
        children.forEach(x => {
            if (x.link) {
                console.log(x.name)
                links.push(x);
            }
            else if (x.schedules.length > 0) {
                const regular = x.getRegularHours(dateTime);
                const schedules = x.getSchedulesInFrame(dateTime, dateTime.toLocalChronos());

                if (regular && regular.getActiveDaysPerWeek() > 3) {
                    filtered.push(x);
                    children = children.filter(y => y.uuid != x.uuid);
                    if (schedules[0].isOpen(dateTime.day(), dateTime.toLocalChronos())) {
                        rnNoneAreOpen = false;
                    }
                }
            }
        })

        setNoneAreOpen(forceOpen ? false : rnNoneAreOpen)
        setMerchants(filtered);
        setLinks(links);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item, dateTime]);

    const tempTheme: Theme = createTheme({
        ...theme,
        palette: {
            ...theme.palette,
            primary: {
                ...theme.palette.primary,
                main: item && item.theme_color || theme.palette.primary.main,
                light: item && item.theme_color ? lighten(item.theme_color, 0.9) : theme.palette.primary.light,
                dark: item && item.theme_color ? darken(item.theme_color, 0.1) : theme.palette.primary.dark,
                contrastText: item && item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.primary.contrastText
            },
        },
        components: {
            ...theme.components,
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'capitalize',
                        variants: [
                            {
                                props: { variant: "flipped" },
                                style: {
                                    '&:hover': {
                                        backgroundColor: item && item.theme_color ? darken(theme.palette.getContrastText(item.theme_color), 0.1) : "unset",
                                    },
                                    backgroundColor: item && item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.primary.contrastText,
                                    color: item && item.theme_color || theme.palette.primary.main,
                                    '&[disabled]': {
                                        backgroundColor: theme.palette.action.disabledBackground,
                                        color: theme.palette.action.disabled,
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.disabledBackground
                                        },
                                    },
                                }
                            },
                            {
                                props: { variant: "outlined_flipped" },
                                style: {
                                    border: "1px solid",
                                    borderColor: item && item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.primary.contrastText,
                                    color: item && item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.primary.main,
                                }
                            },
                        ]
                    }
                },
            }
        }
    })

    if ((hideIfClosed && !forceOpen) && ((noneAreOpen && (merchants && merchants.length > 0)) || (schedule && !schedule.isOpen(dateTime.day(), dateTime.toLocalChronos())))) {
        return <></>;
    }
    else if (hideIfOpen && ((!noneAreOpen && (merchants && merchants.length > 0)) || (schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos())))) {
        return <></>;
    }

    return (
        <ThemeProvider theme={tempTheme}>
            <div style={{
                opacity: forceOpen ? 1 : schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? 1 : 0.5,
                width: "100%",
            }}>
                <ButtonBase
                    ref={ref}
                    key={item.id()}
                    aria-label={`${item.name}, click to learn more.`}
                    className={`column left snug`}
                    sx={{

                        width: "100%",
                        height: 'fit-content',
                        borderRadius: '0.5rem',
                        // overflow: "hidden",
                        backgroundColor: (merchants && merchants.length > 0) || !item.theme_color ? tempTheme.palette.mode === 'dark' ? darken(theme.palette.background.paper, 0.35) : darken(theme.palette.background.paper, 0.05) : item.theme_color,
                        color: (merchants && merchants.length > 0) || !item.theme_color ? theme.palette.text.primary : theme.palette.getContrastText(item.theme_color),
                        ...style,
                        margin: 'unset',
                        marginBottom: 'unset'
                    }}
                    onClick={onClick || undefined}
                >
                    {noneAreOpen && (merchants && merchants.length > 0 && (
                        <div className="flex compact2"
                            style={{
                                position: "absolute",
                                right: "1rem",
                                top: "1.3rem",
                                opacity: 0.75,
                                padding: "0.25rem 0.5rem",
                                width: 'fit-content'
                            }}>
                            <AccessTime fontSize='small' />
                            <Typography variant="caption" sx={{ textAlign: 'left', fontWeight: 600, fontSize: "0.85rem" }}>ALL CLOSED</Typography>
                        </div>
                    ))}
                    {(!merchants || merchants.length === 0) && (forceOpen || schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos())) && (
                        <BackgroundImageGallery
                            base={`${MEDIA_BASE_URI}`}
                            keys={item.cover_img ? [item.getCoverImageLink()] : item.metadata.files || []}
                            width="100%"
                            height="9rem"
                        />
                    )}
                    <div
                        className="column left relaxed"
                        style={{
                            position: "relative",
                            height: "fit-content",
                            padding: "1.5rem 1.5rem",
                            width: "100%",

                        }}
                    >
                        {(!merchants || merchants.length === 0) && item.icon_img && (
                            <PortraitImage
                                path={`${MEDIA_BASE_URI}/${item.icon_img.path}`}
                                diameter="3.5rem"
                                style={{
                                    position: "absolute",
                                    right: "1rem",
                                    top: item.cover_img && (!merchants || merchants.length === 0) && (forceOpen || (schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()))) ? "-1.75rem" : "1rem",
                                    backgroundColor: item.theme_color || "black"
                                }}
                            />
                        )}
                        <div className="column left between" style={{
                            minHeight: (schedule && schedule.isOpen(dateTime.day(), dateTime.toLocalChronos())) && (item.icon_img && !item.cover_img) ? "7rem" : "unset",
                        }}>
                            <div className="flex between">

                                {item.wordmark_img ? (
                                    <BackgroundImageGallery
                                        base={`${MEDIA_BASE_URI}`}
                                        keys={item.wordmark_img ? [item.wordmark_img.path] : item.metadata.files || []}
                                        width="100%"
                                        height="4rem"
                                        style={{
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "left center"
                                        }}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="h6" sx={{ textAlign: 'left', lineHeight: "125%", fontSize: "1.25rem", maxWidth: "calc(100% - 4rem)" }}>{item.name}</Typography>

                                    </>
                                )}
                            </div>

                            {!noneAreOpen && merchants && merchants.length > 0 && (
                                <div className="column compact" id="merchants">
                                    <div
                                        className="flex between merchantCards_wrapList"
                                        style={{
                                            flexWrap: 'wrap'
                                        }}
                                        key="sub_event_links"
                                    >
                                        {merchants.map((x: Event, index: number) => {
                                            if (x.link) return null;
                                            return (
                                                <MerchantChildEditCard
                                                    className={index % 2 === 1 ? "full" : "half"}
                                                    key={x.id()}
                                                    item={x}
                                                    isOpen
                                                    dateTime={dateTime}
                                                    style={{
                                                        width: "calc(50% - 0.25rem)",
                                                        marginBottom: "0.5rem"
                                                    }}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        startViewer(Type.Event, x);
                                                    }}
                                                    hideIfClosed={!forceOpen}
                                                    mini
                                                    soften
                                                    onSelect={() => handleChildSelect(x, true)}
                                                />
                                            )
                                        })}
                                    </div>


                                </div>
                            )}
                            {!merchants || merchants.length === 0 && (
                                <div className="flex between">
                                    {nextInstance && (
                                        <>
                                            <div className="flex compact2 fit">
                                                <AccessTime />
                                                <Typography variant="caption" sx={{ textAlign: 'left' }}>{nextInstance.date.format("MMM DD")}{nextInstance.start_time && ` - ${nextInstance.start_time.print()}`}</Typography>
                                            </div>
                                        </>
                                    )}
                                    {schedule && (
                                        <>
                                            <div className="flex compact2 fit"
                                                style={{
                                                    opacity: forceOpen || schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? 1 : 0.75,
                                                    borderRadius: "100vh",
                                                    padding: "0.25rem 0.5rem",
                                                    backgroundColor: schedule && !schedule.isNotRegular() ? 'transparent' : 'gold',
                                                    color: schedule && !schedule.isNotRegular() ? 'inherit' : 'black',
                                                    width: 'fit-content',
                                                    marginLeft: schedule.isNotRegular() ? 0 : "-0.5rem"
                                                }}>
                                                <AccessTime fontSize='small' />
                                                <Typography variant="caption" sx={{ textAlign: 'left', fontWeight: 600, fontSize: "0.85rem" }}>{schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) ? "OPEN" : "CLOSED"}</Typography>
                                            </div>
                                            {schedule.isOpen(dateTime.day(), dateTime.toLocalChronos()) && (links && links.length > 0) && (
                                                <Button variant="flipped" onClick={() => window.open(links[0].link, '_blank')} key={links[0].id()}>{links[0].name}</Button>
                                            )}
                                        </>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex center middle" style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transform: "translate(-1rem, -1rem)",
                        width: "2.5rem",
                        height: "2.5rem",
                        backgroundColor: "inherit",
                        borderRadius: "100vh"
                    }}>
                        <Checkbox sx={{
                            color: tempTheme.palette.primary.contrastText,

                            '&.Mui-checked': {
                                color: tempTheme.palette.primary.contrastText,
                            },
                        }} onClick={(e) => {
                            e.stopPropagation();
                            onUncheck(item, true);
                        }} checked />
                    </div>
                </ButtonBase>
            </div>
        </ThemeProvider>
    );
});

MerchantLargeEditCard.displayName = 'MerchantLargeEditCard';
export default MerchantLargeEditCard;