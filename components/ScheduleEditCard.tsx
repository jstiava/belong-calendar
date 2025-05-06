import { MouseEvent } from 'react';
import { AllInclusiveOutlined, DateRangeOutlined, DeleteOutline, EditOutlined, LocationOnOutlined, RemoveCircleOutline, ScheduleOutlined, SecurityOutlined, VerifiedOutlined } from "@mui/icons-material";
import { ButtonBase, Typography, Tooltip, IconButton, Button, Chip, useTheme, CircularProgress } from "@mui/material";
import { Location, LocationData, Schedule, ScheduleData } from '@/schema';
import dayjs from '@/lib/utils/dayjs';
import DaySchedulePuck from './DaySchedulePuck';

const ScheduleEditCard = ({ item, onClick, onEdit, onRemove }:
    {
        item: ScheduleData | null;
        onClick?: (e: MouseEvent) => any;
        onEdit?: (item: any) => any;
        onRemove?: (id: string) => void;
    }) => {

    const theme = useTheme();

    if (!item) return <></>
    return (
        <>
            <ButtonBase
                key={item.uuid}
                className="column snug"
                sx={{
                    width: '100%',
                    padding: "0.5rem",
                    alignItems: "flex-start",
                    borderRadius: '0.5rem',
                }}
                onClick={(e) => {
                    e.stopPropagation();

                    if (!onEdit) return;
                    onEdit(item);
                }}
            >
                <div className="flex between" style={{ alignItems: 'flex-start' }}>
                    <div className="flex between">
                        <div
                            className="column compact"
                            style={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                marginLeft: 0,
                                textAlign: 'left'
                            }}
                        >
                            <div className="flex compact">
                                {item.schedule_type === "regular" ? (
                                    <></>
                                ) : (
                                    <Chip sx={{
                                        textTransform: 'capitalize',
                                        backgroundColor: item.schedule_type === "special" ? "gold" : "red",
                                        color: item.schedule_type === "special" ? "black" : "white",
                                        fontWeight: 700,
                                        width: "fit-content"
                                    }}
                                        label={item.schedule_type}
                                    />
                                )}
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                            </div>
                        </div>
                    </div>

                    <div className="flex compact fit">
                        {item.end_date ? (
                            <div className="flex compact2 fit">
                                <DateRangeOutlined fontSize='small' />
                                <Typography variant="caption" noWrap sx={{ width: "fit-content" }}>{dayjs(String(item.start_date)).to(dayjs(String(item.end_date)))}</Typography>
                            </div>
                        ) : (
                            <div className="flex compact2">
                                <AllInclusiveOutlined fontSize='small' />
                                <Typography variant="caption" noWrap>{dayjs(String(item.start_date))?.format("MMM DD, YYYY")}-</Typography>
                            </div>
                        )}
                    </div>
                </div>


                <div className="flex compact2" style={{
                    padding: "0.25rem 0"
                }}>
                    {item.days.map((x : any, i : number) => {

                        const schedule = new Schedule(item);

                        const hours = schedule.getHours(i);

                        if (hours === false) {
                            return (
                                <DaySchedulePuck
                                    key={i}
                                    variant='determinate'
                                    values={[]}
                                    size={"2rem"}
                                    sx={{
                                        opacity: 0.5,
                                        backgroundColor: theme.palette.divider
                                    }}
                                >
                                    <Typography variant="h6" style={{
                                        fontSize: "0.65rem"
                                    }}>{['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'][i]}</Typography>
                                </DaySchedulePuck>
                            )
                        }

                        return (

                            <div className="flex fit" key={i}>
                                <DaySchedulePuck
                                    variant='determinate'
                                    values={hours === true ? [0, 24] : hours.toBreaks().map(c => c.getHMN())}
                                    size={"2rem"}
                                >
                                    <Typography variant="h6" style={{
                                        fontSize: "0.65rem"
                                    }}>{['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'][i]}</Typography>
                                </DaySchedulePuck>
                            </div>
                        )
                    })}

                </div>

                {/* <div className="flex">
                    <Typography sx={{ textAlign: "left" }} variant="caption">{item.as_text}</Typography>
                </div> */}

                <div className="flex right" style={{ marginTop: "0.5rem" }}>
                    {onEdit && (
                        <Button
                            size='small'
                            sx={{ padding: "0", fontSize: "0.9375rem", color: theme.palette.primary.main }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item)
                            }}
                            startIcon={<EditOutlined />}
                        >
                            Edit
                        </Button>
                    )}
                    {onRemove && (
                        <Button
                            size='small'
                            color="error"
                            sx={{ padding: "0", fontSize: "0.9375rem" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(item.uuid)
                            }}
                            startIcon={<DeleteOutline color='error' />}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </ButtonBase>
        </>
    );
};


export default ScheduleEditCard;