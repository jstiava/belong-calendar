import { Box, SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function ZoomIcon(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color : theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 16 16" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.44914 3.3335C0.648801 3.3335 0 3.9823 0 4.78263V9.76855C0 11.3692 1.2976 12.6668 2.89827 12.6668H9.8842C10.6845 12.6668 11.3333 12.018 11.3333 11.2177V6.23177C11.3333 4.6311 10.0357 3.3335 8.43506 3.3335H1.44914ZM16 4.64251V11.3575C16 11.9023 15.3819 12.2171 14.9412 11.8966L12.8824 10.3993C12.5374 10.1484 12.3333 9.74762 12.3333 9.32103V6.67897C12.3333 6.25238 12.5374 5.85156 12.8824 5.60065L14.9412 4.10336C15.3819 3.78289 16 4.09766 16 4.64251Z" fill={fill} />
            </svg>
        </SvgIcon>
    );
}

export default ZoomIcon;
