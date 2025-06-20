import { MEDIA_BASE_URI } from "@/lib/useComplexFileDrop"
import { Event, Group, Member, Profile, isAllSingleDay, isEventCalendar, isMoment, isMultiDayEvent, isNotScheduled, isScheduled, isSingleTimeEvent } from '@jstiava/chronos'
import { CalendarMonthOutlined, WorkspacesOutlined, LocationOnOutlined, PersonOutline, Google, ScheduleOutlined, TodayOutlined } from "@mui/icons-material";
import { Avatar, AvatarGroup, ButtonBase, CircularProgress, Skeleton, SxProps, Typography, useTheme } from "@mui/material"
import ResolveItemIcon from "./ResolveItemIcon";


function ResolveItemSubtitle({
    item
}: {
    item: Member
}) {

    const theme = useTheme();

    const sx = {
        fontSize: "0.85rem",
        lineHeight: "125%",
        textTransform: 'capitalize',
        display: "inline-block",
        whiteSpace: "nowrap",
        overflow: "clip",
        textOverflow: "ellipsis",
        textAlign: 'left'
    };

    if (item instanceof Event) {

        if (item.subtitle) {
            return (
                <div className="flex compact2 top left">
                    <ResolveItemIcon
                        item={item}
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>{item.subtitle}</Typography>
                </div>
            )
        }

        if (isMoment(item)) {
            return (
                <div className="flex compact2 center left">
                    <TodayOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>{item.date.format("MMM DD, YYYY")} - {item.start_time.print(true)}</Typography>
                </div>
            )
        }

        if (isSingleTimeEvent(item)) {
            return (
                <div className="flex compact2 center left">
                    <TodayOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>{item.start_time.print(true)}</Typography>
                </div>
            )
        }



        if (isAllSingleDay(item)) {
            return (
                <div className="flex compact2 center left">
                    <TodayOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>{item.date.format("MMM DD, YYYY")}</Typography>
                </div>
            )
        }

        if (isMultiDayEvent(item)) {
            return (
                <div className="flex compact2 center left">
                    <CalendarMonthOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>{item.date.to(item.end_date)}</Typography>
                </div>
            )
        }

        if (isEventCalendar(item)) {
            return (
                <div className="flex compact2 center left">
                    <CalendarMonthOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>Calendar</Typography>
                </div>
            )
        }


        if (isScheduled(item) && !isNotScheduled(item)) {
            return (
                <div className="flex compact2 center left">
                    <ScheduleOutlined
                        sx={{
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary
                        }}
                    />
                    <Typography sx={sx}>Event</Typography>
                </div>
            )
        }
    }

    if (item instanceof Group) {
        return (
            <div className="flex compact2 center left">
                <ResolveItemIcon
                    item={item}
                    sx={{
                        fontSize: "0.875rem",
                        color: theme.palette.text.primary
                    }}
                />
                <Typography sx={sx}>{item.integration ? `Integration (${item.integration})` : item.type}</Typography>
            </div>
        );
    }

    if (item instanceof Location) {
        return (
            <div className="flex compact2 center left">
                <ResolveItemIcon
                    item={item}
                    sx={{
                        fontSize: "0.875rem",
                        color: theme.palette.text.primary
                    }}
                />
                <Typography sx={sx}>{item.type}</Typography>
            </div>
        );
    }

    return (
        <div className="flex compact2 center left">
            <ResolveItemIcon
                item={item}
                sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary
                }}
            />
            <Typography sx={sx}>{item.type}</Typography>
        </div>
    );
}


export default function ItemStub({
    item,
    parent,
    onClick,
    sx = {}
}: {
    item: Member | null,
    parent?: Member | null,
    onClick?: any
    sx?: SxProps
}) {

    const theme = useTheme();

    if (!item) {
        return <div className="flex compact center">
            <Skeleton variant="circular" width={"2rem"} height={"2rem"} />
            <div className="column compact2">
                <Skeleton variant="rectangular" animation="wave" width={180} height={"0.85rem"} />
                <Skeleton variant="rectangular" animation="wave" width={140} height={"0.5rem"} />
            </div>
            {/* <CircularProgress
                size={20}
                sx={{
                    color: theme.palette.text.primary
                }}
            /> */}
        </div>
    }

    return (
        <ButtonBase className="flex left compact top"
            sx={{
                width: "100%",
                ...sx
            }}
            onClick={e => {
                if (onClick) {
                    onClick(e);
                }
            }}
        >
            <AvatarGroup spacing="medium" sx={{
                marginRight: !parent ? "0.5rem !important" : "-0.25rem !important"
            }}>
                {parent && (
                    <Avatar
                        alt={parent.name}
                        src={`${MEDIA_BASE_URI}/${parent.getIconPath()}`}
                        sx={{
                            transform: "translate(-0.25rem, -0.4rem)",
                            width: "1rem",
                            height: "1rem",
                            border: `0.15rem solid ${parent?.theme_color || 'transparent'} !important`,
                            backgroundColor: parent.theme_color,
                            color: parent.theme_color ? theme.palette.getContrastText(parent.theme_color) : theme.palette.text.primary
                        }}
                    >
                        <ResolveItemIcon
                            item={parent}
                            sx={{
                                fontSize: "0.75rem",
                                color: parent.theme_color ? theme.palette.getContrastText(parent.theme_color) : theme.palette.text.primary
                            }}
                        />
                    </Avatar>
                )}
                <Avatar
                    alt={item.name}
                    src={`${MEDIA_BASE_URI}/${item.getIconPath()}`}
                    sx={{
                        transform: parent ? "translate(-35%, 0%)" : "unset",
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: item.theme_color
                    }}
                >
                    <ResolveItemIcon
                        item={item}
                        sx={{
                            fontSize: "1rem",
                            color: item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.text.primary
                        }}
                    />
                </Avatar>
            </AvatarGroup>
            <div className="column snug"
                style={{
                    overflow: "hidden"
                }}
            >
                <Typography sx={{
                    fontWeight: 700,
                    letterSpacing: 0,
                    fontSize: "0.85rem",
                    lineHeight: "125%",
                    textAlign: 'left',
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    width: "100%"
                }}><span dangerouslySetInnerHTML={{ __html: item.name }} /></Typography>


                <ResolveItemSubtitle
                    item={item}
                />
            </div>
        </ButtonBase>
    )
}