import { styled } from "@mui/material";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";


interface ThemedDatePickerProps<TDate> extends DatePickerProps<any> {
    mode?: 'light' | 'dark';
}

const StyledDatePicker = styled((props: ThemedDatePickerProps<any>) => {
    
    const { mode = 'light', slotProps, ...rest} = props;
    
    return (
        <DatePicker
            {...rest}
            format="ddd, MMM D, YYYY"
            slotProps={{
                ...slotProps,
                textField: {
                    variant: 'filled',
                },
            }}
            // slots={{
            //     openPickerButton: () => null, // Disable the calendar view button
            // }}
        />
    )

})(({ theme, mode = "light" }) => {

    const base = mode === 'light' ? '#ffffff' : '#000000';
    const color = theme.palette.primary.main

    return ({
        '& .Mui-disabled': {
            opacity: 0.6
        },
        '&:hover .MuiInputBase-root': {
            backgroundColor: `${base}10`,
        },
        '& .MuiInputBase-root': {
            backgroundColor: `${base}20`,
        },
        '& .MuiInputBase-input': {
            color: base,
        },
        '& .MuiFormLabel-root': {
            color: base,
        },
        '& .MuiFormLabel-root.Mui-focused': {
            color: base,
        },
        '& .MuiFormLabel-root.Mui-disabled': {
            color: base,
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: base,
        },
        '& .MuiSvgIcon-root': {
            color: base,
        },
        '& .MuiFilledInput-underline:before': { borderBottomColor: base },
        '&:hover .MuiFilledInput-underline:before': { borderBottomColor: base },
        '& .MuiFilledInput-underline:after': { borderBottomColor: base },
        '&:hover .MuiFilledInput-underline:after': { borderBottomColor: color || base },
    })
})

export default StyledDatePicker;