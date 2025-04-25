import { MouseEvent } from 'react';
import { DateRangeOutlined, EventOutlined, LocationOnOutlined, RemoveCircleOutline } from "@mui/icons-material";
import { ButtonBase, IconButton, Tooltip, Typography } from "@mui/material";
import { Event } from '@/schema';

export default function EventCard({ item, onClick, onRemove }: { item: Event; onClick?: (e: MouseEvent) => any; onRemove?: (id: string) => void }) {
    return (
        <>
            <ButtonBase
                key={item.id()}
                sx={{
                    display: 'flex',
                    alignItems: "flex-start",
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '1rem 0 1rem 0.5rem',
                    borderRadius: '0.5rem',
                }}
                onClick={onClick || undefined}
            >
                {item.cover_img ? (
                    <div style={{ backgroundImage: `url(${item.getCoverImageLink()})`, backgroundPosition: 'cover', height: "3rem", width: "5rem", borderRadius: "0.5rem" }}></div>
                ) : (
                    <EventOutlined fontSize="small" />
                )}
                <div
                    className="flex"
                    style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginLeft: '1rem',
                        maxWidth: "calc(100% - 5rem)"
                    }}
                >
                    <Typography variant="body1" sx={{ textAlign: 'left' }}>{item.name}</Typography>
                    {item.start_time && (

                        <Typography variant="caption" sx={{ textAlign: 'left' }}>{item.date.format("MMMM DD, YYYY")}, {item.start_time.to(item.end_time)}</Typography>
                    )}
                    {item.location_name && (
                        <Typography variant="caption" style={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "clip",
                            textOverflow: "ellipsis",
                            width: "100%",
                        }}><strong>{item.location_name}</strong>, {item.location_address}</Typography>
                    )}
                </div>
                {onRemove && (
                    <Tooltip title="Remove">
                        <IconButton
                            onClick={(e) => {
                                onRemove(item.id());
                                e.stopPropagation();
                            }}
                        >
                            <RemoveCircleOutline color="error" fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </ButtonBase>

        </>
    );
}