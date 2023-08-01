import {Button, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "../theme";
import Navbar from "./Navbar";
import React from "react";
import {useNavigate} from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {Navbar()}
            <h1>page not found</h1>
            <Button
                variant="contained"
                sx={{m: "50px"}}
                onClick={() => navigate(`/films`)}>
                Go to Films
            </Button>
        </ThemeProvider>
    )
}

export default NotFound