import { useTheme } from "@mui/material";

export default function AnalogClockIcon({ hour, minute, color }: { hour: number, minute: number, color? : string }) {

    const theme = useTheme();
    const hourAngle = (360 / 12) * (hour % 12) + (minute / 60) * 30;
    const minuteAngle = (360 / 60) * minute;

    const theColor = color ? color : theme.palette.text.primary;

    return (
        <svg width="20" height="20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke={theColor} strokeWidth="10" fill="transparent" />
            {/* Hour hand */}
            <line x1="50" y1="50" x2={50 + 15 * Math.sin((Math.PI / 180) * hourAngle)} y2={50 - 15 * Math.cos((Math.PI / 180) * hourAngle)} stroke={theColor}  strokeWidth="10" strokeLinecap="round" />
            {/* Minute hand */}
            <line x1="50" y1="50" x2={50 + 25 * Math.sin((Math.PI / 180) * minuteAngle)} y2={50 - 25 * Math.cos((Math.PI / 180) * minuteAngle)} stroke={theColor}  strokeWidth="10" strokeLinecap="round" />
        </svg>
    );
}
