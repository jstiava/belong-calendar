import { SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function JotformForm(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color :  theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <SvgIcon {...props} fill={fill}>
           <svg height={size} width={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6"><path fill="#fff" d="M18 1H6a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3Z"></path><path fill="#FFB629" d="M6 17.5A1.5 1.5 0 0 1 7.5 16h9a1.5 1.5 0 0 1 0 3h-9A1.5 1.5 0 0 1 6 17.5Z"></path><path fill="#FF6100" d="M6 12.5A1.5 1.5 0 0 1 7.5 11h9a1.5 1.5 0 0 1 0 3h-9A1.5 1.5 0 0 1 6 12.5Z"></path><path fill="#09F" d="M6 7.5A1.5 1.5 0 0 1 7.5 6h9a1.5 1.5 0 0 1 0 3h-9A1.5 1.5 0 0 1 6 7.5Z"></path></svg>
        </SvgIcon>
    );
}

export default JotformForm;
