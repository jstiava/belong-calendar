import { useTheme } from "@mui/material"

export const DIVIDER_NO_ALPHA_COLOR = '#e0e0e0';

export default function Divider({
    vertical = false
} : {
    vertical?: boolean
}) {

    const theme = useTheme();

    return (
        <div style={{
            height: vertical ? "100%" : "0.1rem",
            width: vertical ? "0.1rem" : "100%",
            backgroundColor: DIVIDER_NO_ALPHA_COLOR
        }}></div>
    )
}