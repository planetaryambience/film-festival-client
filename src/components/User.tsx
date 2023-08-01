import React from "react";
import axios from "axios";
import {
    Alert,
    Avatar,
    Box,
    Button, CssBaseline, Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper, Snackbar,
    Stack,
    TextField,
    ThemeProvider
} from "@mui/material"
import CSS from 'csstype';  
import Navbar from "./Navbar";
import Typography from "@mui/material/Typography";
import EditIcon from '@mui/icons-material/Edit';
import theme from "../theme";
import { useNavigate } from "react-router-dom";
import Delete from "@mui/icons-material/Delete";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "250px",
    width: "700px",
    margin: "10px",
    padding: "30px"
}

const User = () => {
    const userId = localStorage.getItem("userId")
    const authToken = localStorage.getItem("token")
    const imageURL = `http://localhost:4941/api/v1/users/${userId}/image`
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [imageErrorFlag, setImageErrorFlag] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const navigate = useNavigate()

    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [currentPassword, setCurrentPassword] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [openFNameEdit, setOpenFNameEdit] = React.useState(false)
    const [openLNameEdit, setOpenLNameEdit] = React.useState(false)
    const [openEmailEdit, setOpenEmailEdit] = React.useState(false)
    const [openPasswordEdit, setOpenPasswordEdit] = React.useState(false)
    const [openDelete, setOpenDelete] = React.useState(false)
    const [image, setImage] = React.useState<File | null>()

    const [user, setUser] = React.useState<UserReturnWithEmail>({
        firstName: "",
        lastName: "",
        email: ""
    })

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        setErrorFlag(false);
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show)

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    const handleUploadImage = (event: any) => {
        setImage(event.target.files[0])
    }

    const handleOpenDeleteDialog = () => {
        setOpenDelete(true)
    }

    const handleCloseDeleteDialog = () => {
        setOpenDelete(false)
    }

    const handleOpenFNameEdit = () => {
        setOpenFNameEdit(true)
    }
    const handleCloseFNameEdit = () => {
        setOpenFNameEdit(false)
    }
    const handleFirstNameEdit = (event: any) => {
        setFirstName(event.target.value)
    }

    const handleOpenLNameEdit = () => {
        setOpenLNameEdit(true)
    }
    const handleCloseLNameEdit = () => {
        setOpenLNameEdit(false)
    }
    const handleLastNameEdit = (event: any) => {
        setLastName(event.target.value)
    }

    const handleOpenEmailEdit = () => {
        setOpenEmailEdit(true)
    }
    const handleCloseEmailEdit = () => {
        setOpenEmailEdit(false)
    }
    const handleEmailEdit = (event: any) => {
        setEmail(event.target.value)
    }

    const handleOpenPasswordEdit = () => {
        setOpenPasswordEdit(true)
    }
    const handleClosePasswordEdit = () => {
        setPassword("")
        setCurrentPassword("")
        setOpenPasswordEdit(false)
    }
    const handlePasswordEdit = (event: any) => {
        setPassword(event.target.value)
    }
    const handleCurrentPassword = (event: any) => {
        setCurrentPassword(event.target.value)
    }

    const handleSubmitFirstName = (event: any) => {
        event.preventDefault()
        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, {"firstName": firstName},
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                handleCloseFNameEdit()
                setErrorMessage("")
                getUser()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const handleSubmitLastName = (event: any) => {
        event.preventDefault()
        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, {"lastName": lastName},
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                handleCloseLNameEdit()
                setErrorMessage("")
                getUser()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const handleSubmitEmail = (event: any) => {
        event.preventDefault()
        axios.patch(`http://localhost:4941/api/v1/users/${userId}`, {"email": email},
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                handleCloseEmailEdit()
                setErrorMessage("")
                getUser()
            }, (error) => {
                setErrorFlag(true)
                if (error.response.status === 400) {
                    setErrorMessage("Invalid email format")
                } else if (error.response.status === 403) {
                    setErrorMessage("Email already in use")
                } else {
                    setErrorMessage(error.response.statusText)
                }
            })
    }

    const handleSubmitPassword = (event: any) => {
        event.preventDefault()
        axios.patch(`http://localhost:4941/api/v1/users/${userId}`,
            {"password": password, "currentPassword": currentPassword},
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                handleClosePasswordEdit()
                setErrorMessage("")
                getUser()
            }, (error) => {
                setErrorFlag(true)
                if (error.response.status === 401) {
                    setErrorMessage("Incorrect current password")
                } else {
                    setErrorMessage(error.response.statusText)
                }
            })
    }

    const deleteImage = () => {
        axios.delete(`http://localhost:4941/api/v1/users/${userId}/image`,
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
                window.location.reload()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const uploadImage = () => {
        if (image) {
            axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, image,
                {headers: {'X-Authorization': localStorage.getItem("token"), 'Content-Type': image['type']}})
                .then(() => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setImage(null)
                    window.location.reload()
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                })
        }
    }

    const getUser = () => {
        axios.get(`http://localhost:4941/api/v1/users/${userId}`,
            {headers: {'X-Authorization': authToken}})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        const getUser = () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}`,
                {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUser(response.data)
                }, () => {
                })
        }

        const getImage = () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}/image`)
                .then(() => {
                    setImageErrorFlag(false)
                }, () => {
                    setImageErrorFlag(true)
                })
        }

        getUser()
        getImage()
    }, [userId, authToken])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {Navbar()}
            {authToken ?
                <div>
            <Snackbar open={errorFlag} autoHideDuration={4000}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <h1>{user.firstName} {user.lastName}</h1>
            <Paper style={cardStyle}>
                <Stack direction="row" spacing={4} justifyContent="center">
                    <Stack direction="column" spacing={1}>
                        <Avatar sx={{ bgcolor: 'limegreen', width: "100px", height: "100px"}} src={imageURL}/>
                        <input type="file"
                               accept={"image/gif|image/jpeg|image/png"}
                               onChange={handleUploadImage}/>
                        {image ?
                            <Button color="secondary" variant="outlined" size="small"
                                    startIcon={<EditIcon/>} onClick={uploadImage}>
                                Upload
                            </Button>
                        :
                            <Tooltip title="Chose an image first">
                                <span>
                                    <Button color="secondary" variant="outlined" size="small"
                                            startIcon={<EditIcon/>} disabled> Upload
                                    </Button>
                                </span>

                            </Tooltip>
                        }
                        {!imageErrorFlag ?
                            <Button color="secondary" variant="outlined" size="small"
                                    startIcon={<Delete/>}
                                    onClick={handleOpenDeleteDialog}>Delete
                            </Button>
                        :
                            <Tooltip title="Upload an image first">
                                <span>
                                    <Button color="secondary" variant="outlined" size="small"
                                        startIcon={<Delete/>} disabled>Delete
                                    </Button>
                                </span>
                            </Tooltip>}
                    </Stack>
                    
                    <Stack direction="column" spacing={3}>
                        <Stack direction="row" spacing={5}>
                            <Typography>
                                First Name: {user.firstName}
                            </Typography>
                            <Button color="secondary" variant="contained" size="small"
                                    startIcon={<EditIcon/>}
                                    onClick={handleOpenFNameEdit}>
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={5}>
                            <Typography>
                                Last Name: {user.lastName}
                            </Typography>
                            <Button color="secondary" variant="contained" size="small"
                                    startIcon={<EditIcon/>}
                                    onClick={handleOpenLNameEdit}>
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={5}>
                            <Typography>
                                Email: {user.email}
                            </Typography>
                            <Button color="secondary" variant="contained" size="small"
                                    startIcon={<EditIcon/>}
                                    onClick={handleOpenEmailEdit}>
                            </Button>
                        </Stack>
                        <Button color="secondary" variant="contained" size="small"
                                startIcon={<EditIcon/>}
                                onClick={handleOpenPasswordEdit}> Change password
                        </Button>
                    </Stack>
                </Stack>
                <Button
                    sx={{m: "50px"}}
                    onClick={() => navigate(`/user/${userId}/films`)}>
                    View films
                </Button>
            </Paper>
            <Dialog open={openDelete} onClick={handleCloseDeleteDialog}>
                <DialogTitle >Delete Image</DialogTitle>
                <DialogContent>
                    <DialogContentText >
                        Are you sure you want to delete the current image?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button variant="outlined" color="error" onClick={deleteImage} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openFNameEdit} onClose={handleCloseFNameEdit}>
                <Box sx={{width: '400px', height: '200px'}}>
                    <DialogTitle>Edit First Name</DialogTitle>
                    <DialogContent>
                            <TextField
                                name="first-name-edit"
                                label="First Name"
                                variant="standard"
                                fullWidth
                                defaultValue={user.firstName}
                                onChange={handleFirstNameEdit}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseFNameEdit}>Cancel</Button>
                        <Button type="submit"
                                onClick={handleSubmitFirstName}>
                            Change
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={openLNameEdit} onClose={handleCloseLNameEdit}>
                <Box sx={{width: '400px', height: '200px'}}>
                    <DialogTitle>Edit Last Name</DialogTitle>
                    <DialogContent>
                            <TextField
                                name="last-name-edit"
                                label="Last Name"
                                variant="standard"
                                fullWidth
                                defaultValue={user.lastName}
                                onChange={handleLastNameEdit}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseLNameEdit}>Cancel</Button>
                        <Button type="submit"
                                onClick={handleSubmitLastName}>
                            Change
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={openEmailEdit} onClose={handleCloseEmailEdit}>
                <Box sx={{width: '400px', height: '200px'}}>
                    <DialogTitle>Edit Email</DialogTitle>
                    <DialogContent>
                            <TextField
                                name="email-edit"
                                label="Email"
                                variant="standard"
                                fullWidth
                                defaultValue={user.email}
                                onChange={handleEmailEdit}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEmailEdit}>Cancel</Button>
                        <Button type="submit"
                                onClick={handleSubmitEmail}>
                            Change
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={openPasswordEdit} onClose={handleClosePasswordEdit}>
                <Box sx={{width: '400px', height: '250px'}}>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogContent>
                        <TextField
                            name="password"
                            label="Current Password"
                            variant="standard"
                            fullWidth
                            value={currentPassword}
                            type="password"
                            onChange={handleCurrentPassword}/>
                        <TextField
                            name="password-edit"
                            label="New Password"
                            variant="standard"
                            value={password}
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            sx={{mt: "10px"}}
                            InputProps={{endAdornment:<InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>}}
                            onChange={handlePasswordEdit}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClosePasswordEdit}>Cancel</Button>
                        <Button type="submit"
                            disabled={password.length < 6}
                            onClick={handleSubmitPassword}>
                            Change
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
                </div>
                : <Typography variant={"h5"} color={"error"}>Not logged in</Typography> }
        </ThemeProvider>
    )
}

export default User