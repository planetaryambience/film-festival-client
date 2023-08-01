import React from "react";
import {Alert, Box, Button, IconButton, InputAdornment, Link, TextField, Typography, ThemeProvider, CssBaseline, Stack, Paper, Snackbar} from "@mui/material";
import axios from "axios";
import CSS from 'csstype';
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RegisterLoginNavbar from "./RegisterLoginNavBar";
import theme from "../theme";

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "560px",
    width: "600px",
    margin: "10px",
    padding: "20px"
}

const RegisterUser = () => {
    const [user, setUser] = React.useState<UserRegister>({
        firstName: "",
        lastName: "",
        email: "",
        password: ""

    })
    const [image, setImage] = React.useState<File | null>()
    const acceptedFileTypes = ["gif", "png", "jpeg", "jpg"]
    const [showPassword, setShowPassword] = React.useState(false)
    const authToken = localStorage.getItem('token')
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const navigate = useNavigate()

    const handleClickShowPassword = () => setShowPassword((show) => !show)

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return
        }
        setErrorFlag(false)
    }
    

    const handleFormChanges = (prop: keyof UserRegister) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({...user, [prop]: event.target.value})
    } 

    const handleUploadImage = (event: any) => {
        setImage(event.target.files[0])
    }

    const uploadImage = (userId: number) => {
        if (image) {
            axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, image, {
            headers: {'X-Authorization': localStorage.getItem('token'), 'Content-Type': image['type']}
            })
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
        }
    }

    const handleFormSubmit = (event: any) => {
        event.preventDefault()
        axios.post("http://localhost:4941/api/v1/users/register", user)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                localStorage.setItem("userId", response.data.userId)
                loginUser(user.email, user.password)
            }, (e) => {
                setErrorFlag(true)
                if (e.response.statusText.includes("data/email")) {
                    setErrorMessage("Invalid email format")
                } else if (e.response.statusText.includes("Forbidden")) {
                    setErrorMessage("Email already in use")
                } else {
                    setErrorMessage(e.response.statusText)
                }
            })
    }

    const loginUser = (email: string | null, password: string | null) => {
        if (email && password) {
            axios.post("http://localhost:4941/api/v1/users/login", {"email": email, "password": password})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    localStorage.setItem("token", response.data.token)
                    if (image) {
                        uploadImage(response.data.userId)
                    }
                    navigate('/films')
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        } else {
            setErrorFlag(true)
            setErrorMessage("ERROR: failed to log in after user register. email or password is NULL")
        }
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

            <h1>Create an Account</h1>
            {authToken ? 
                <Typography>Must log out of current account before creating another account</Typography>
            :
                <Paper style={cardStyle}>
                    <Stack direction="column" justifyContent="center" spacing={4}
                        component="form" noValidate onSubmit={handleFormSubmit}>
                        <TextField
                            required
                            autoFocus
                            id="first-name"
                            name="firstName"
                            label="First Name"
                            variant="standard"
                            onChange={handleFormChanges("firstName")}/>

                        <TextField
                            required
                            id="last-name"
                            name="lastName"
                            label="Last Name"
                            variant="standard"
                            onChange={handleFormChanges("lastName")}/>
    
                        <TextField
                            required
                            id="email"
                            name="email"
                            label="Email"
                            variant="standard"
                            onChange={handleFormChanges("email")}/>
                        {((user.email.length === 0) || (user.email.match("@"))) ? "" :
                            <Typography variant="caption" color="tomato">
                                Email must contain an "@" symbol and top domain (for example x@y.z)
                            </Typography>}

                        <TextField
                            required
                            id="password"
                            name="password"
                            label="Password"
                            variant="standard"
                            type={showPassword ? "text" : "password"}
                            onChange={handleFormChanges("password")}
                            InputProps={{endAdornment:<InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>}}/>
                        {(user.password.length <= 6 && user.password.length >= 1) ? 
                            <Typography variant="caption" color="tomato">
                                Password must be at least 6 characters
                            </Typography> : ""}

                        <Box>
                            <Stack direction="row" spacing={3} justifyContent="center">
                                <p>Add a profile picture (optional)</p>
                                <Button variant="outlined" color="secondary" component="label">
                                    Add
                                    <input hidden type="file"
                                        accept={"image/gif, image/jpeg, image/png"}
                                        onChange={handleUploadImage}/>
                                </Button>
                            </Stack>
                            {(image) ?
                                <Stack direction="row" justifyContent="center" sx={{marginTop: "4px"}}>
                                    <AttachFileIcon/>
                                    <Typography color="#acacac">{image.name}</Typography>
                                </Stack>
                            : "" }
                            {(image && !(acceptedFileTypes.some(type => image?.name.includes(type)))) ?
                                <Typography variant="caption" color="tomato">
                                    *Image must be of type .gif, .png, .jpeg, or .jpg
                                </Typography> : "" }
                        </Box>
                        <Button 
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={(!((user.firstName.length > 0)
                                && (user.lastName.length > 0)
                                && (user.email.length > 0)
                                && (user.password.length >= 6)
                                && (!image || acceptedFileTypes.some(type => image?.name.includes(type)))))}>
                            Sign up
                        </Button>
                        <Typography>
                            Already have an account? &nbsp;
                            <Link underline="hover"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {navigate("/login")}}>Log In</Link>
                        </Typography>
                    </Stack>
                </Paper>
            }
        </ThemeProvider>
    )
}

export default RegisterUser