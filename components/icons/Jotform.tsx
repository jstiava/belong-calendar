import { Box, SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function JotformIcon(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color : theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <div style={{
            width: size,
            height: size,
            backgroundImage: `url(/jotform.png)`,
            backgroundSize: 'contain',
            backgroundPosition: "center",
            backgroundRepeat: 'no-repeat',
            filter: fill != '#fff' ? 'invert(1)' : 'unset'
        }}></div>
    );
}

export default JotformIcon;
