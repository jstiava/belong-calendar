import { styled, TextField } from "@mui/material";


const LargeTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    color: 'var(--text-color)',

    '& .MuiFormLabel-root': {
        color: 'var(--text-color)',
    },
    '& .MuiFormLabel-root.Mui-focused': {
        color: 'var(--text-color)',
    },
    '& .MuiInputBase-root': {
        color: 'var(--text-color)',
    },
    '& .MuiInputBase-input': {
        color: 'var(--text-color)',
        fontSize: '2rem',
        lineHeight: '2rem',
        fontWeight: 900,
        letterSpacing: '0.15px',
    },
    '& .MuiInputBase-input.Mui-focused': {
        color: 'var(--text-color)',
    },
    '& .MuiInput-underline:before': {
        borderBottomColor: 'var(--text-color)',
    },
    '&:hover .MuiInput-underline:before': {
        borderBottomColor: 'var(--text-color)',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'var(--text-color)',
    },
    '&:hover .MuiInput-underline:after': {
        borderBottomColor: 'var(--text-color)',
    },
}));


export default LargeTextField;