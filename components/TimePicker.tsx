import { LockOutlined } from "@mui/icons-material";
import { Button, Drawer, IconButton, InputAdornment, Paper, Slide, styled, ToggleButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { renderTimeViewClock, TimePicker, TimePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import StyledToggleButtonGroup from "./StyledToggleButtonGroup";
import { useState } from "react";

interface ThemedDatePickerProps extends TimePickerProps<Dayjs> {
    mode?: 'light' | 'dark' | string;
    color?: string;
    debug?: boolean
}

const StyledTimePicker = styled((props: ThemedDatePickerProps) => {

    const theme = useTheme();
    const { mode = 'light', sx, slotProps, slots, ...rest } = props;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className="column snug fit">
            <TimePicker
            {...rest}
            format='h:mm A'
            closeOnSelect={false}
            viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
            }}
            desktopModeMediaQuery={'(min-width: 37.49rem)'}
            slotProps={{
                ...slotProps,
                field: { shouldRespectLeadingZeros: true },
                textField: {
                    variant: 'filled',
                },
                popper: {
                    disablePortal: true,
                },
                layout: {
                    sx: {
                        '&.MuiPickersLayout-root': {
                            display: 'flex',
                            flexDirection: 'column',
                        }
                    }
                }
            }}
            slots={{
                ...slots,
                leftArrowIcon: () => null,
                rightArrowIcon: () => null,
                toolbar: (props) => {
                    return (
                        <div className="flex between" style={{
                            padding: "1.5rem 1.5rem 0 1.5rem",
                        }}>
                            <Typography variant="h6">{rest.label}</Typography>
                            {props.value && <Typography>{props.value.format("h:mm A")}</Typography>}
                        </div>
                    )
                },
                actionBar: (props) => {
                    return (
                        <div className="flex between" style={{
                            padding: "1rem"
                        }}>
                            <div className="flex snug" style={{
                                width: 'fit-content',
                            }}>
                                {rest.value && (
                                    <StyledToggleButtonGroup value={rest.value.format("A")} size='small' isMini={false}>
                                        <ToggleButton value="AM" onClick={() => {
                                            if (!rest.value) {
                                                return;
                                            }
                                            if (rest.onChange && rest.value.format("A") === "PM") {
                                                rest.onChange(rest.value.flipMeridium(), {
                                                    validationError: null
                                                });
                                            }
                                        }}>AM</ToggleButton>
                                         <ToggleButton value="PM" onClick={() => {
                                            if (!rest.value) {
                                                return;
                                            }
                                            if (rest.onChange && rest.value.format("A") === "AM") {
                                                rest.onChange(rest.value.flipMeridium(), {
                                                    validationError: null
                                                });
                                            }
                                        }}>PM</ToggleButton>
                                    </StyledToggleButtonGroup>
                                )}
                            </div>
                            <Button variant="text" onClick={props.onAccept}>Close</Button>
                        </div>
                    )
                },
                desktopPaper: (props: any) => (
                    <Paper
                        {...props}
                        sx={{
                            ...props.sx,
                            borderRadius: '0.5rem',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                ),
                dialog: (props: any) => (
                    <Drawer
                        {...props}
                        anchor="bottom"
                        transitionDuration={300}
                    />
                ),
                mobilePaper: (props: any) => (
                    <Slide direction="up" in={props.open} mountOnEnter unmountOnExit>
                        <Paper
                            {...props}
                            sx={{
                                ...props.sx,
                                borderRadius: '0.5rem',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                    </Slide>
                )
            }}
            ampmInClock={false}
        />
        {props.debug && (
            <Typography>{JSON.stringify(props.value, null, 2)}</Typography>
        )}
        </div>
    )

})(({ theme, mode = "light" }) => {

    const base = mode === 'light' ? '#ffffff' : '#000000';
    const color = theme.palette.primary.main

    return ({
        '& .Mui-disabled': {
            opacity: 0.6
        },
        '&:hover .MuiInputBase-root': {
            backgroundColor: `${base}10`,
        },
        '& .MuiInputBase-root': {
            backgroundColor: `${base}20`,
        },
        '& .MuiInputBase-input': {
            color: base,
        },
        '& .MuiFormLabel-root': {
            color: base,
        },
        '& .MuiFormLabel-root.Mui-focused': {
            color: base,
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: base,
        },
        '& .MuiSvgIcon-root': {
            color: base,
        },
        '& .MuiFilledInput-underline:before': { borderBottomColor: base },
        '&:hover .MuiFilledInput-underline:before': { borderBottomColor: base },
        '& .MuiFilledInput-underline:after': { borderBottomColor: base },
        '&:hover .MuiFilledInput-underline:after': { borderBottomColor: color || base },
    })
})

export default StyledTimePicker;