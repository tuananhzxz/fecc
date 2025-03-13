import { createTheme } from "@mui/material";

const CustomTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#f50057',
        },
        secondary: {
            main: '#3f51b5',
        },
        background: {
            default: '#f5f5f5',
        },
        text: {
            primary: '#3f51b5',
        }
    },
})

export default CustomTheme;