"use client"
import {
    AddOutlined,
    CalendarMonthOutlined,
    PersonOutline,
    RemoveCircleOutline,
    ShareOutlined,
    VisibilityOff,
    VisibilityOutlined,
    WorkspacesOutlined,
} from '@mui/icons-material';
import {
    AccordionDetails,
    Button,
    Typography,
    useTheme,
    IconButton,
    TextField,
    Avatar,
    CircularProgress,
    AvatarGroup,
    Chip,
} from '@mui/material';
import { useState } from 'react';
import AccordionCreateModule from '@/components/accordions/AccordionCreateModule';
import { Event, EventData, Member } from "@/schema";
import { Type } from '@/types/globals';
import { UseIAM } from '@/lib/global/useIAM';
import { UseBaseCore } from '@/lib/global/useBase';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import { Base as UnverifiedBase } from '@/types/globals';
import { UseSession } from '@/lib/global/useSession';

interface IAMAccordionModuleProps {
    item: any;
    handleChange: any;
    expanded: any;
    onChange: (junctions: EventData['junctions']) => any;
    removeModule?: any;
    Base: UseBaseCore,
    Parent?: UseBaseCore,
    source: Member,
    parent: Member,
    Session: UseSession,
    props?: any;
    IAM: UseIAM
};

export default function IAMAccordionModule({
    item,
    handleChange,
    expanded,
    Base,
    IAM,
    Parent,
    onChange,
    removeModule,
    source,
    parent,
    Session,
    ...props
}: IAMAccordionModuleProps) {
    const theme = useTheme();

    const [search, setSearch] = useState(null);

    const base = item.token ? new UnverifiedBase(item.token) : null;

    if (!IAM.members) {
        return (
            <div className="flex center middle" style={{
                padding: "2rem"
            }}>
                <CircularProgress color="primary" />
            </div>
        )
    }

    return (
        <AccordionCreateModule expanded={expanded} onChange={onChange}>
            {/* <AccordionSummaryCreateModule
                name="Identity & Access Management (IAM)"
                expanded={expanded}
                icon={<KeyOutlined />}
                removeModule={removeModule}
                preview={
                    <></>
                }
            /> */}
            <AccordionDetails>
                <div className="flex compact">
                    <TextField
                        fullWidth
                        value={search}
                        onChange={e => {
                            try {
                                setSearch(e.target.value)
                            }
                            catch (err) {
                                return;
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        size="large"
                    >Invite</Button>
                </div>


                <div className="column"
                    style={{
                        padding: "1.5rem 0.5rem"
                    }}
                >


                    {IAM.members.map(theMember => {

                        const isYou = (parent && (theMember.id() === parent.id())) || theMember.id() === source.id() || (Session.session && (theMember.id() === Session.session.id()));

                        const junction = theMember.junctions.get(item.uuid);

                        return (
                            <div className="flex between center"
                                key={theMember.id()}
                            >
                                <div className="flex compact" style={{
                                    width: "calc(100% - 10rem)"
                                }}>
                                    <div className="flex fit">
                                        <AvatarGroup spacing={24}>
                                            {isYou && Session.session && (
                                                <Avatar
                                                    key={Session.session.id()}
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: "0.75rem",
                                                        backgroundColor: theme.palette.background.paper,
                                                        color: theme.palette.text.primary,
                                                        border: `2px solid ${theme.palette.divider} !important`,
                                                        textTransform: 'uppercase',
                                                        fontWeight: 800,
                                                        margin: "-0.25rem -0.25rem 0 0 !important"
                                                    }}
                                                    alt={Session.session.name || ""}
                                                    src={`${MEDIA_BASE_URI}/${Session.session.getIconPath(true)}`}
                                                >
                                                </Avatar>
                                            )}
                                            <Avatar
                                                key={theMember.id()}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: "0.85rem",
                                                    backgroundColor: theme.palette.background.paper,
                                                    color: theme.palette.text.primary,
                                                    border: `2px solid ${theMember.theme_color || theme.palette.primary.main} !important`,
                                                }}
                                                alt={theMember.name || ""}
                                                src={`${MEDIA_BASE_URI}/${theMember.getIconPath(true)}`}
                                            >
                                                {theMember.type === Type.Event && <CalendarMonthOutlined sx={{
                                                    fontSize: '1rem'
                                                }} />}
                                                {theMember.type === Type.Group && <WorkspacesOutlined sx={{
                                                    fontSize: '1rem'
                                                }} />}
                                                {theMember.type === Type.Profile && <PersonOutline sx={{
                                                    fontSize: '1rem'
                                                }} />}
                                            </Avatar>
                                        </AvatarGroup>
                                    </div>
                                    <div className="column snug">
                                        <Typography sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 700
                                        }}>{theMember.name}</Typography>
                                        {isYou && (
                                            <Typography sx={{
                                                fontSize: "0.75rem",
                                                opacity: 0.9
                                            }}>{Session.session.name}{` (You)`}</Typography>
                                        )}
                                    </div>
                                </div>
                                <div className="flex center right" style={{
                                    width: "10rem"
                                }}>
                                    {!isYou && !(theMember instanceof Event) && <Button>Switch</Button>}

                                    {junction && (
                                        <div className="flex compact fit">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {

                                                    return;
                                                }}>
                                                {junction.is_public ? <VisibilityOutlined /> : <VisibilityOff />}
                                            </IconButton>
                                            {junction.certificate_wild_card && !junction.certificate_id && (
                                                <Chip label="Full Access" />
                                            )}
                                        </div>
                                    )}

                                    <IconButton
                                        color="error"
                                        onClick={async (e) => {
                                            await IAM.remove(theMember);
                                            return;
                                        }}>
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </div>
                            </div>
                        )
                    })}

                    <div className="column compact">
                        {parent && !IAM.members.some(x => parent.id() === x.id()) && (
                            <div className="flex between center"
                                key={parent.id()}
                            >
                                <div className="flex compact" style={{
                                    width: "calc(100% - 10rem)"
                                }}>
                                    <AvatarGroup>

                                        <Avatar
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                fontSize: "0.85rem",
                                                backgroundColor: theme.palette.background.paper,
                                                color: theme.palette.text.primary,
                                                border: `2px solid ${parent.theme_color || theme.palette.primary.main}`,
                                                margin: "0.5rem 0.5rem 0.5rem 0"
                                            }}
                                            alt={parent.name || ""}
                                            src={`${MEDIA_BASE_URI}/${parent.getIconPath(true)}`}
                                        >
                                            {parent.type === Type.Event && <CalendarMonthOutlined sx={{
                                                fontSize: '1rem'
                                            }} />}
                                            {parent.type === Type.Group && <WorkspacesOutlined sx={{
                                                fontSize: '1rem'
                                            }} />}
                                            {parent.type === Type.Profile && <PersonOutline sx={{
                                                fontSize: '1rem'
                                            }} />}
                                        </Avatar>
                                    </AvatarGroup>
                                    <Typography sx={{
                                        fontSize: "0.875rem"
                                    }}>{parent.name}</Typography>
                                </div>
                                <div className="flex center right" style={{
                                    width: "10rem"
                                }}>
                                    <Button
                                        variant="text"
                                        startIcon={<AddOutlined />}
                                        onClick={async () => {
                                            await IAM.invite(parent);
                                            return;
                                        }}
                                    >Add</Button>
                                </div>
                            </div>
                        )}

                        {source && (source.id() != item.uuid) && !IAM.members.some(x => source.id() === x.id()) && (
                            <div className="flex between center"
                                key={source.id()}
                            >
                                <div className="flex compact" style={{
                                    width: "calc(100% - 10rem)"
                                }}>
                                    <AvatarGroup>

                                        {Session.session && (
                                            <Avatar
                                                key={Session.session.id()}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: "0.75rem",
                                                    backgroundColor: theme.palette.background.paper,
                                                    color: theme.palette.text.primary,
                                                    border: `2px solid #000 !important`,
                                                    textTransform: 'uppercase',
                                                    fontWeight: 800,
                                                    margin: "-0.25rem -0.25rem 0 0 !important"
                                                }}
                                                alt={Session.session.name || ""}
                                                src={`${MEDIA_BASE_URI}/${Session.session.getIconPath(true)}`}
                                            >
                                            </Avatar>
                                        )}
                                        <Avatar
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                fontSize: "0.85rem",
                                                backgroundColor: theme.palette.background.paper,
                                                color: theme.palette.text.primary,
                                                border: `2px solid ${source.theme_color || theme.palette.primary.main} !important`,
                                                margin: "0.5rem 0.5rem 0.5rem 0"
                                            }}
                                            alt={source.name || ""}
                                            src={`${MEDIA_BASE_URI}/${source.getIconPath(true)}`}
                                        >
                                            {source.type === Type.Event && <CalendarMonthOutlined sx={{
                                                fontSize: '1rem'
                                            }} />}
                                            {source.type === Type.Group && <WorkspacesOutlined sx={{
                                                fontSize: '1rem'
                                            }} />}
                                            {source.type === Type.Profile && <PersonOutline sx={{
                                                fontSize: '1rem'
                                            }} />}
                                        </Avatar>
                                    </AvatarGroup>
                                    <div className="column snug">
                                        <Typography sx={{
                                            fontSize: "0.875rem"
                                        }}>{source.name}</Typography>
                                        {Session.session && (
                                            <Typography sx={{
                                                fontSize: "0.75rem",
                                                opacity: 0.9
                                            }}>{Session.session.name}{` (You)`}</Typography>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </AccordionDetails>
        </AccordionCreateModule>
    );
}
