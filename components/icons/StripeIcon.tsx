import { Box, SvgIcon, useTheme } from '@mui/material';

// CustomIcon component
function StripeIcon(props: any) {

    const theme = useTheme();

    const fill = props.sx.color ? props.sx.color : theme.palette.primary.main;
    const size = props.sx.fontSize ? props.sx.fontSize : "1rem";
    return (
        <SvgIcon {...props} fill={fill}>
            <svg height={size} width={size}  viewBox="0 0 425 596" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M177.727 167.406C177.727 191.742 207.229 207.229 261.062 227.14C362.096 263.274 424.779 306.045 424.779 408.556C424.779 470.503 403.391 518.435 362.096 550.885C325.221 580.382 270.647 595.868 205.017 595.868C122.417 595.868 42.771 570.797 0 546.46L22.1239 408.556C72.2732 438.053 148.966 460.913 195.426 460.913C233.036 460.913 253.689 446.903 253.689 422.566C253.689 397.494 232.301 381.267 168.142 358.407C68.5841 322.273 7.37279 279.497 7.37279 179.204C7.37279 123.894 27.2843 78.1692 65.6361 46.4602C102.506 16.2223 154.132 0 216.079 0C303.833 0 367.257 24.3363 398.23 39.0874L376.106 175.514C337.019 156.344 280.238 134.956 224.928 134.956C194.69 134.956 177.727 146.753 177.727 167.406Z" fill={fill} />
            </svg>
        </SvgIcon>
    );
}

export default StripeIcon;
