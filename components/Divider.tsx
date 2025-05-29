import { SxProps, useTheme } from "@mui/material"

export const DIVIDER_NO_ALPHA_COLOR = '#e0e0e0';

export default function Divider({
    vertical = false,
    sx = {}
} : {
    vertical?: boolean,
    sx?: any
}) {

    const theme = useTheme();

    return (
        <div style={{
            height: sx.height ? sx.height : vertical ? "100%" : "0.1rem",
            width: sx.width ? sx.width : vertical ? "0.1rem" : "100%",
            backgroundColor: theme.palette.divider
        }}></div>
    )
}