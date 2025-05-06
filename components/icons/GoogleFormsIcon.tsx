import { Box, SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function GoogleCalendarIcon(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color : theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <div style={{
            width: size,
            height: size,
            backgroundImage: `url(/google_forms.png)`,
            backgroundSize: 'contain',
            backgroundPosition: "center",
            backgroundRepeat: 'no-repeat',
        }}></div>
    );
}

export default GoogleCalendarIcon;
