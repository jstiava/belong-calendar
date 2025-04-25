import { styled, ToggleButtonGroup, toggleButtonGroupClasses, lighten, darken, ToggleButtonGroupProps } from "@mui/material";

interface StyledToggleButtonGroupProps extends ToggleButtonGroupProps {
    isMini?: boolean;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)<StyledToggleButtonGroupProps>(({ theme, isMini }) => ({
    display: 'flex',
    flexDirection: isMini ? "column" : "row",
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        borderRadius: theme.shape.borderRadius,
        padding: "0.5rem 0.75rem",
        color: theme.palette.text.primary,
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
        [`&.${toggleButtonGroupClasses.selected}:not(.MuiToggleButton-warning):not(.Mui-error)`]: {
            backgroundColor: theme.palette.mode === 'light' ? lighten(theme.palette.primary.main, 0.85) : darken(theme.palette.primary.main, 0.75)
        }
    },
    // [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    // {
    //     marginLeft: -1,
    //     borderLeft: '1px solid transparent',
    // },
}));

export default StyledToggleButtonGroup;