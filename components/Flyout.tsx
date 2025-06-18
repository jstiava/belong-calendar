import { Drawer, Popover, SxProps, useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { JSX, useState, Ref } from "react";


export default function Flyout({ isOpen, anchorEl, onClose, children, sx = {} }: { isOpen: boolean, anchorEl: HTMLButtonElement | null, onClose?: () => any, children: JSX.Element, sx?: SxProps }) {

    const theme = useTheme();
    const router = useRouter();

    const [isRightClick, setIsRightClick] = useState(false);
    const isSM = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            {isSM ? (
                <Drawer
                    anchor='bottom'
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    open={isOpen}
                    onClose={() => {
                        onClose && onClose();
                    }}
                    keepMounted
                    sx={{
                        zIndex: 4000,
                        '& .MuiDrawer-paper': {
                            width: '100vw',
                            boxShadow: 1,
                            // backgroundColor: isRightClick ? theme.palette.background.paper : theme.palette.primary.main || lighten(theme.palette.background.paper, 0.05),
                            // color: isRightClick ? theme.palette.text.primary : event?.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText,
                        },
                    }}
                >
                    {children}
                </Drawer>
            ) : (
                <Popover
                    anchorEl={anchorEl}
                    open={isOpen}
                    // placement='left-start'
                    onClose={(e: any) => {
                        e.stopPropagation();
                        onClose && onClose();
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    // disableScrollLock={true}
                    // popperOptions='top-end'
                    sx={{
                        // zIndex: 4000,
                        // top: 0,
                        boxShadow: 14,
                        '& .MuiPopover-paper': {
                            ...sx,
                            width: isRightClick ? '15rem' : sx.width ? sx.width : '25rem',
                            boxShadow: 5,
                            marginTop: isRightClick ? "0.25rem" : "0",
                            // backgroundColor: isRightClick ? theme.palette.background.paper : event && event.theme_color || lighten(theme.palette.background.paper, 0.05),
                            // color: isRightClick ? theme.palette.text.primary : (event && event.theme_color) && theme.palette.getContrastText(event.theme_color) || theme.palette.text.primary,
                        }
                    }}
                >
                    {children}
                </Popover >
            )}
        </>
    )
}