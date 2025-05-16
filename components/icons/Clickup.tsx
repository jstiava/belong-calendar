import { Box, SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function ClickupIcon(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color : theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <div style={{
            width: size,
            height: size,
            backgroundImage: `url(/clickup.png)`,
            backgroundSize: 'contain',
            backgroundPosition: "center",
            backgroundRepeat: 'no-repeat',
            filter: fill === theme.palette.text.primary ? 'invert(1)' : 'unset'
        }}></div>
    );
}

export default ClickupIcon;
