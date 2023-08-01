import { Alert, Button, CssBaseline, Link, Paper, Snackbar, Stack, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import CSS from 'csstype';
import theme from "../theme";
import RegisterLoginNavbar from "./RegisterLoginNavBar";

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "300px",
    width: "600px",
    margin: "10px",
    padding: "20px"
}

const LoginUser = () => {
    const [user, setUser] = React.useState<UserLogin>({
        email: "",
        password: ""
    })

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const authToken = localStorage.getItem('token')
    const navigate = useNavigate()

    const handleFormChanges = (prop: keyof UserRegister) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({...user, [prop]: event.target.value})
    } 

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return
        }
        setErrorFlag(false)
    }

    const handleFormSubmit = (event: any) => {
        event.preventDefault()
        axios.post("http://localhost:4941/api/v1/users/login", user)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                localStorage.setItem("userId", response.data.userId)
                localStorage.setItem("token", response.data.token)
                navigate('/films')
            }, (error) => {
                setErrorFlag(true)
                if (error.response.statusText.includes("data/email")) {
                    setErrorMessage("Invalid email format")
                } else if (error.response.status === 401) {
                    setErrorMessage("Incorrect email/password")
                } else {
                    setErrorMessage(error.response.statusText)
                }
            })
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {RegisterLoginNavbar()}
            <Snackbar open={errorFlag} autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <h1>Log In</h1>
            {authToken ? 
                <Typography>Must log out of current account before creating another account</Typography>
            :
                <Paper style={cardStyle}>
                    <Stack direction="column" spacing={4}
                        component="form" noValidate onSubmit={handleFormSubmit}>
                        <TextField
                            required
                            id="email"
                            name="email"
                            label="Email"
                            variant="standard"
                            onChange={handleFormChanges("email")}/>

                        <TextField
                            required
                            id="password"
                            name="password"
                            label="Password"
                            variant="standard"
                            type="password"
                            onChange={handleFormChanges("password")}/>

                        <Button 
                            type="submit" variant="contained" color="secondary"
                            disabled={(!((user.email.length > 0) && (user.password.length >= 6)))}>
                            Log In
                        </Button>
                        <Typography>
                        Don't have an account? &nbsp;
                        <Link underline="hover"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {navigate("/register")}}>Sign Up</Link>
                    </Typography>
                    </Stack>
                </Paper>
            }
        </ThemeProvider>
    )
}

export default LoginUser;