import { MEDIA_BASE_URI } from "@/lib/useComplexFileDrop"
import { Event, Group, Member, Profile } from "@/schema"
import { CalendarMonthOutlined, WorkspacesOutlined, LocationOnOutlined, PersonOutline } from "@mui/icons-material";
import { Avatar, AvatarGroup, CircularProgress, Skeleton, Typography, useTheme } from "@mui/material"



export default function ItemStub({
    item,
    parent
}: {
    item: Member | null,
    parent?: Member | null
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
        <div className="flex compact">
            <AvatarGroup spacing="medium" sx={{
                marginRight: !parent ? "0.5rem !important" : "-0.75rem !important"
            }}>
                {parent && (
                    <Avatar
                        alt={item.name}
                        src={`${MEDIA_BASE_URI}/${item.getIconPath()}`}
                        sx={{
                            transform: "translate(-0.25rem, -0.4rem)",
                            width: "1rem",
                            height: "1rem",
                            border: `0.15rem solid ${item.theme_color || 'transparent'} !important`,
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        {item instanceof Event && <CalendarMonthOutlined fontSize="small" />}
                        {item instanceof Group && <WorkspacesOutlined sx={{
                            fontSize: "0.75rem",
                            color: item.theme_color
                        }} />}
                        {item instanceof Location && <LocationOnOutlined sx={{
                            fontSize: "0.875rem"
                        }} />}
                        {item instanceof Profile && <PersonOutline sx={{
                            fontSize: "0.75rem",
                            color: item.theme_color
                        }} />}
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
                    {item instanceof Event && <CalendarMonthOutlined fontSize="small" />}
                    {item instanceof Group && <WorkspacesOutlined sx={{
                        fontSize: "0.75rem",
                        color: 'var(--text-color)'
                    }} />}
                    {item instanceof Location && <LocationOnOutlined sx={{
                        fontSize: "0.875rem",
                        color: 'var(--text-color)'
                    }} />}
                    {item instanceof Profile && <PersonOutline sx={{
                        fontSize: "1rem",
                        color: 'var(--text-color)'
                    }} />}
                </Avatar>
            </AvatarGroup>
            <div className="column snug">
                <Typography sx={{
                    fontWeight: 700,
                    letterSpacing: 0,
                    fontSize: "0.85rem",
                    lineHeight: "125%"
                }}>{item.name}</Typography>
                <div className="flex compact2">
                    {item instanceof Event && <CalendarMonthOutlined fontSize="small" />}
                    {item instanceof Group && <WorkspacesOutlined sx={{
                        fontSize: "0.75rem",
                        color: 'var(--text-color)'
                    }} />}
                    {item instanceof Location && <LocationOnOutlined sx={{
                        fontSize: "0.875rem",
                        color: 'var(--text-color)'
                    }} />}
                    {item instanceof Profile && <PersonOutline sx={{
                        fontSize: "0.875rem",
                        color: 'var(--text-color)'
                    }} />}
                    <Typography sx={{
                        fontSize: "0.85rem",
                        lineHeight: "125%"
                    }}>{item.subtitle || "Profile"}</Typography>
                </div>
            </div>
        </div>
    )
}