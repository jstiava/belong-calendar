import { IconButton, Tooltip, Zoom } from "@mui/material";
import { JSX } from "react";


export default function StyledIconButton({
    title,
    children,
    onClick
}: {
    title: string,
    children: JSX.Element,
    onClick: any
}) {

    return (
        <IconButton
            onClick={onClick}
            aria-label="info"
            title={title || ""}
        >
            {children}
        </IconButton>
    )
}