import { Alert, Box, Button, CssBaseline, FormControl, FormHelperText, Input, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, Snackbar, Stack, TextField, ThemeProvider, Typography } from "@mui/material"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from "axios"
import React from "react"
import CSS from 'csstype';
import Navbar from "./Navbar"
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import theme from "../theme";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "720px",
    width: "600px",
    margin: "10px",
    padding: "20px"
}

interface NewFilm {
    title: string,
    description: string,
    genreId: number,
    ageRating?: string,
    releaseDate?: string | null,
    runtime?: number | null
}

const ageRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"]
const acceptedFileTypes = ["gif", "png", "jpeg", "jpg"]

const FilmCreate = () => {
    const [film, setFilm] = React.useState<NewFilm>({
        title: "",
        description: "",
        genreId: -1,
        ageRating: "TBC",
        releaseDate: null,
        runtime: null
    })
    const [image, setImage] = React.useState<File | null>()
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [genre, setGenre] = React.useState("")
    const releaseDate = dayjs().add(1, 'day')
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const navigate = useNavigate()
    const authToken = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return
        }
        setErrorFlag(false);
    }

    const handleFormChanges = (prop: keyof NewFilm) => (event: any) => {
        let value: any
        if (prop === "releaseDate") {
            const d = event.$d
            value = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
        } else {
            value = event.target.value
            if (prop === "genreId") {
                setGenre(value)
                value = genres.find(g => g.name === value)?.genreId
            }
            if (prop === "runtime") {
                value = parseInt(value, 10)
            }
        }
        setFilm({...film, [prop]: value})
    } 

    const handleUploadImage = (event: any) => {
        setImage(event.target.files[0])
    }

    const handleFormSubmit = (event: any) => {
        event.preventDefault()
        if (!film.releaseDate) {
            delete film.releaseDate
        }
        if (!film.runtime) {
            delete film.runtime
        }
        axios.post("http://localhost:4941/api/v1/films/", film, {
            headers: {'X-Authorization': authToken}
        })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                uploadImage(response.data.filmId)
                navigate(`/user/${userId}/films`)
            }, (error) => {
                setErrorFlag(true)
                if (error.response.statusText.includes("data/runtime")) {
                    setErrorMessage("Runtime must be less than 300 minutes")
                } else if (error.response.statusText.includes("data/title")) {
                    setErrorMessage("Tile must be less than 64 characters")
                } else if (error.response.statusText.includes("data/description")) {
                    setErrorMessage("Description must be less than 512 characters")
                } else if (error.response.status === 403) {
                    setErrorMessage("Film with this title already exists")
                } else {
                    setErrorMessage(error.response.statusText)
                }
            })
    }

    const uploadImage = (filmId: number) => {
        if (image) {
            axios.put(`http://localhost:4941/api/v1/films/${filmId}/image`, image, {
            headers: {'X-Authorization': localStorage.getItem('token'), 'Content-Type': image['type']}
            })
            .then(() => {
                setErrorFlag(false)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
        }
    }

    React.useEffect(() => {
        const getGenres = () => {
            axios.get("http://localhost:4941/api/v1/films/genres")
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setGenres(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getGenres()
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {Navbar()}
            <Snackbar open={errorFlag} autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <h1>Add a film</h1>
            {authToken ? 
                <Paper style={cardStyle}>
                    <Stack component="form" noValidate 
                        direction="column" spacing={3} sx={{width: 500, m: "auto"}}
                        onSubmit={handleFormSubmit}>
                        <TextField
                            required
                            id="title"
                            name="title"
                            label="Title"
                            variant="standard"
                            autoFocus
                            onChange={handleFormChanges("title")}/>

                        <TextField
                            required
                            id="description"
                            name="description"
                            label="Description"
                            variant="standard"
                            multiline rows={4}
                            onChange={handleFormChanges("description")}/>

                        <FormControl sx={{m: 1}}>
                            <InputLabel id="genre">Genre</InputLabel>
                            <Select
                                required
                                labelId="genre-select-label"
                                id="genre-select"
                                onChange={handleFormChanges("genreId")}
                                value={genre ? genre : ""}
                                label="genre"
                                MenuProps={MenuProps}>
                                {genres.map((genre) => (
                                    <MenuItem key={genre.genreId} value={genre.name}>{genre.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker minDate={dayjs().add(1, 'day')} label="Release Date"
                                value={releaseDate}
                                onChange={handleFormChanges("releaseDate")}/>
                        </LocalizationProvider>

                        <FormControl sx={{m: 1}}>
                            <InputLabel id="age-rating">Age Rating</InputLabel>
                            <Select
                                labelId="age-rating-select-label"
                                id="age-rating-select"
                                onChange={handleFormChanges("ageRating")}
                                input={<OutlinedInput label="age rating" />}
                                defaultValue="TBC"
                                MenuProps={MenuProps}>
                                {ageRatings.map((rating) => (
                                    <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="standard" sx={{ m: 1, mt: 3}}>
                            <FormHelperText id="runtime-helper-text">Runtime</FormHelperText>
                            <Input
                                id="runtime"
                                type="number"
                                endAdornment={<InputAdornment position="end">mins</InputAdornment>}
                                aria-describedby="standard-runtime-helper-text"
                                inputProps={{
                                    'aria-label': 'runtime',
                                    min: "0"
                                }}
                                defaultValue={0}
                                onChange={handleFormChanges("runtime")}
                            />
                        </FormControl>  

                        <Box>
                            <Stack direction="row" spacing={3} justifyContent="center">
                                <p>Add an image (required): </p>
                                <Button variant="outlined" color="secondary" component="label">
                                    Upload
                                    <input hidden type="file"
                                        accept={"image/gif, image/jpeg, image/png"}
                                        onChange={handleUploadImage}/>
                                </Button>
                            </Stack>
                            {image ? 
                                <Stack direction="row" justifyContent="center" sx={{marginTop: "4px"}}>
                                    <AttachFileIcon/>
                                    <Typography color="#acacac">{image.name}</Typography>
                                </Stack>
                            : <Typography color="tomato">Please upload an image</Typography>}
                            {(image && !(acceptedFileTypes.some(type => image?.name.includes(type)))) ?
                                <Typography variant="caption" color="tomato">
                                    *Image must be of type .gif, .png, .jpeg, or .jpg
                                </Typography> : "" }
                        </Box>
                        <Button
                            type="submit" variant="contained"
                            disabled={(!(image && (acceptedFileTypes.some(type => image?.name.includes(type)))
                                && (film.genreId > 0) 
                                && (film.title.length > 0) 
                                && (film.description.length > 0)))}>
                            Add Film
                        </Button>
                    </Stack>
                </Paper>
            :
                <Typography>Must be logged in to list a new film</Typography>
            }
        </ThemeProvider>
    )
}

export default FilmCreate