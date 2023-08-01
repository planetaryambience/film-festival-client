import React from "react";
import {
    Alert,
    Stack,
    Paper,
    Card,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions,
    Rating,
    TextField,
    ThemeProvider,
    CssBaseline,
    Typography,
    Avatar,
    Tooltip,
    Divider,
    DialogContentText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    FormHelperText,
    Input,
    InputAdornment,
    IconButton,
    Snackbar
} from "@mui/material"
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CSS from 'csstype';
import AddBoxIcon from '@mui/icons-material/AddBox';

import FilmReviewObject from "./FilmReviewObject";
import FilmObject from "./FilmObject";
import Navbar from "./Navbar";
import theme from "../theme";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "425px",
    width: "600px",
    margin: "10px",
    padding: "5px"
}

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface EditFilm {
    title: string,
    description: string,
    genreId: number | null,
    ageRating: string | null,
    releaseDate?: string | null,
    runtime?: number | null
}

const ageRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"]
const acceptedFileTypes = ["gif", "png", "jpeg", "jpg"]

const Film = () => {
    const {id} = useParams()
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [imageErrorFlag, setImageErrorFlag] = React.useState(false)
    const [openReview, setOpenReview] = React.useState(false)

    const [film, setFilm] = React.useState<FilmFull>({filmId: -1, title: "", genreId: -1,
        	releaseDate: "", directorId: -1, directorFirstName: "", directorLastName: "",
            rating: -1, ageRating: "", description: "", numReviews: -1, runtime: -1})

    const [editFilm, setEditFilm] = React.useState<EditFilm>({
        title: "", description: "", genreId: -1, ageRating: null, releaseDate: null,  runtime: null
    })

    const [filmReviews, setFilmReviews] = React.useState<Array<Review>>([])
    const [sameGenreFilms, setSameGenreFilms] = React.useState<Array<Film>>([])
    let [sameDirectorFilms, setSameDirectorFilms] = React.useState<Array<Film>>([])
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [rating, setRating] = React.useState(0)
    const [review, setReview] = React.useState(" ")
    const [image, setImage] = React.useState<File | null>()

    const authToken = localStorage.getItem('token')
    const userId = localStorage.getItem("userId")
    const imageURL = `http://localhost:4941/api/v1/films/${id}/image`
    const directorImage = `http://localhost:4941/api/v1/users/${film.directorId}/image`
    const navigate = useNavigate()

    const [openEdit, setOpenEdit] = React.useState(false)
    const [openDelete, setOpenDelete] = React.useState(false)
    const releaseDate = dayjs(new Date(film.releaseDate))
    const currentDate = dayjs()

    let uId = -99
    if (userId) {
        uId = parseInt(userId, 10)
    }

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return
        }
        setErrorFlag(false)
    }

    const handleOpenReviewDialog = () => {
        setOpenReview(true)
    }

    const handleCloseReviewDialog = () => {
        setRating(0)
        setOpenReview(false)
    }

    const handleOpenDeleteDialog = () => {
        setOpenDelete(true)
    }

    const handleCloseDeleteDialog = () => {
        setOpenDelete(false)
    }


    const handleUploadImage = (event: any) => {
        setImage(event.target.files[0])
    }

    const handleFormChanges = (prop: keyof EditFilm) => (event: any) => {
        let value: any
        if (prop === "releaseDate") {
            const d = event.$d
            value = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
        } else {
            value = event.target.value
            if (prop === "genreId") {
                value = genres.find(g => g.name === value)?.genreId
            }
            if (prop === "runtime") {
                value = parseInt(value, 10)
            }
        }
        setEditFilm({...editFilm, [prop]: value})
    }

    const handleOpenEditDialog = () => {
        setOpenEdit(true)
    }

    const handleCloseEditDialog = () => {
        setOpenEdit(false)
    }

    const handleRatingChange = (event: any) => {
        setRating(parseInt(event.target.value, 10))
    }

    const handleTextReviewChange = (event: any) => {
        setReview(event.target.value)
    }

    const handleSubmitReview = () => {
        handleCloseReviewDialog()
        const reviewData = {
            "rating": rating,
            "review": review
        }
        
        axios.post(`http://localhost:4941/api/v1/films/${film.filmId}/reviews`, reviewData,
            {headers: {'X-Authorization': authToken}
        })
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
                getFilmReviews()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const handleEditFilm = () => {
        if (!editFilm.releaseDate) {
            delete editFilm.releaseDate
        }
        if (!editFilm.runtime) {
            delete editFilm.runtime
        }
        axios.patch(`http://localhost:4941/api/v1/films/${film.filmId}`, editFilm,
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
                setOpenEdit(false)
                if (image) {
                    uploadImage(film.filmId)
                }
                getFilm()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const uploadImage = (filmId: number) => {
        if (image) {
            axios.put(`http://localhost:4941/api/v1/films/${filmId}/image`, image, {
                headers: {'X-Authorization': localStorage.getItem('token'), 'Content-Type': image['type']}})
                .then(() => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    window.location.reload()
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                })
        }
    }

    const deleteFilm =() => {
        axios.delete(`http://localhost:4941/api/v1/films/${film.filmId}/`,
            {headers: {'X-Authorization': localStorage.getItem("token")}})
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
                navigate(`/user/${userId}/films`)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })
    }

    const getFilmGenre = (genreId: number) => {
        const filmGenre = genres.find(genre => genre.genreId === genreId)
        if (filmGenre) {
            return filmGenre.name
        } else {
            return "NULL"
        }
    }

    const reviewRows = () => {
        return filmReviews.map((review: Review) => (
            <FilmReviewObject key={review.reviewerId} review={review}/>
        ))
    }

    const similarFilmsRows = () => {
        let similarFilms = [...sameDirectorFilms, ...sameGenreFilms]
        // remove any duplicate films
        similarFilms = similarFilms.filter((film: Film, index: number, arr: Array<Film>) => {
            return arr.map(f => f.filmId).indexOf(film.filmId) === index
        })
        return similarFilms.map((film: Film) => (
            <FilmObject key={film.filmId} film={film} genre={getFilmGenre(film.genreId)}/>
        ))
    }

    const getSameDirectorFilms = (directorId: number, filmId: number) => {
        axios.get(`http://localhost:4941/api/v1/films?directorId=${directorId}`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSameDirectorFilms(response.data.films.filter((f: FilmFull) => f.filmId !== filmId))
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getSameGenreFilms = (genreId: number, filmId: number) => {
        axios.get(`http://localhost:4941/api/v1/films?genreIds=${genreId}`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSameGenreFilms(response.data.films.filter((f: FilmFull) => f.filmId !== filmId))
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getFilmReviews = () => {
        axios.get(`http://localhost:4941/api/v1/films/${id}/reviews`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilmReviews(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getFilm = () => {
        axios.get(`http://localhost:4941/api/v1/films/${id}`)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilm(response.data)

                setEditFilm({
                    title: response.data.title,
                    description: response.data.description,
                    genreId: response.data.genreId,
                    ageRating: response.data.ageRating,
                    releaseDate: null,
                    runtime: response.data.runtime
                })
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        const getFilm = () => {
            axios.get(`http://localhost:4941/api/v1/films/${id}`)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilm(response.data)
                    getSameGenreFilms(response.data.genreId, response.data.filmId)
                    getSameDirectorFilms(response.data.directorId, response.data.filmId)
    
                    setEditFilm({
                        title: response.data.title,
                        description: response.data.description,
                        genreId: response.data.genreId,
                        ageRating: response.data.ageRating,
                        releaseDate: null,
                        runtime: response.data.runtime
                    })
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }

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
    
        const getFilmReviews = () => {
            axios.get(`http://localhost:4941/api/v1/films/${id}/reviews`)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilmReviews(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
    
        const getImage = () => {
            axios.get(`http://localhost:4941/api/v1/films/${id}/image`)
                .then(() => {
                    setImageErrorFlag(false)
                }, () => {
                    setImageErrorFlag(true)
                })
        }

        getImage()
        getFilm()
        getFilmReviews()
        getGenres()
    }, [id])

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

            <Stack direction="row" spacing={3} justifyContent="center">
                <h1>{film.title}</h1>
                {((uId === film.directorId) && (film.numReviews <= 0)) ?
                    <Box>
                        <IconButton sx={{mt: "25px"}} aria-label='edit' onClick={handleOpenEditDialog}>
                            <EditIcon/>
                        </IconButton>
                    </Box> : ""}
                {(uId === film.directorId) ?
                    <Box>
                        <IconButton sx={{mt: "25px"}} aria-label='delete' onClick={handleOpenDeleteDialog}>
                            <DeleteIcon/>
                        </IconButton>
                    </Box> : ""}
            </Stack>
            <Stack direction="row" spacing={2}
                justifyContent="center">
                {imageErrorFlag ?
                    <Paper>
                        <img src="/noImageFound.png" alt="film hero"
                            style={{marginBottom: "-5px"}}
                            width="512" height="512"/>
                    </Paper>
                :
                    <Paper>
                        <img src={imageURL} alt="film hero"
                            style={{marginBottom: "-5px"}}
                            width="450px" height="450px"/>
                    </Paper>
                }
                <Card style={cardStyle}>
                    <p>{film.description}</p>
                    <p>Release Date: {new Date(film.releaseDate).toLocaleString()}</p>
                    {film.runtime ? <p>Runtime: {film.runtime} minutes</p>
                    : <p>Runtime: N/A</p>}
                    <p>Age Rating: {film.ageRating}</p>
                    <p>Genre: {getFilmGenre(film.genreId)}</p>
                    <Stack direction="row" justifyContent="center" sx={{mt: "-12px"}}>
                        <p>Overall Rating: </p>
                        <Rating name="rating" sx={{m: "5px", mt:"20px"}}
                            max={10} value={film.rating}
                            precision={0.2} size="small" readOnly/>
                        <p>({film.rating}/10)</p>
                    </Stack>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <Typography sx={{mt: "10px"}}>
                            Directed by {film.directorFirstName} {film.directorLastName}
                        </Typography>
                        <Avatar alt={film.directorFirstName} src={directorImage} />
                    </Stack>
                </Card>
            </Stack>

            <Stack direction="row" spacing={5}
                justifyContent="center"
                sx={{mt: '50px'}}>
                <Typography variant="h6">Reviews ({film.numReviews})</Typography>
                {(currentDate >= releaseDate && uId !== film.directorId) ? 
                    <Button color="secondary" variant="contained" size="small"
                        startIcon={<AddBoxIcon/>}
                        onClick={handleOpenReviewDialog}>
                        Add a Review
                    </Button>
                : 
                    <Tooltip title="Can't review own film or one not yet released."
                        arrow placement="top">
                        <span>
                            <Button color="secondary" variant="contained" size="small"
                                startIcon={<AddBoxIcon/>}
                                disabled>
                                Add a Review
                            </Button>
                        </span>
                    </Tooltip>
                }
                <Dialog open={openReview} onClose={handleCloseReviewDialog}>
                    {authToken ? 
                        <Box sx={{width: '600px', height: '300px'}}>
                            <DialogTitle>Add a Review</DialogTitle>
                            <DialogContent>
                                <Stack direction="column" spacing={2}>
                                    <Rating
                                        name="review-rating"
                                        value={rating}
                                        defaultValue={0}
                                        max={10}
                                        onChange={handleRatingChange}/>
                                    <TextField
                                        name="review-text"
                                        label="Review (optional)"
                                        variant="standard"
                                        multiline rows={4}
                                        onChange={handleTextReviewChange}/>
                                </Stack>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseReviewDialog}>Cancel</Button>
                                <Button type="submit" 
                                    disabled={(rating <= 0)}
                                    onClick={handleSubmitReview}>
                                    Add
                                </Button>
                            </DialogActions>
                        </Box>
                        :
                        <Box sx={{p: '10px'}}>
                            <h4>You must be logged in to review a film.</h4>
                            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                                <Button color="secondary" onClick={handleCloseReviewDialog}>
                                    Cancel
                                </Button>
                                <Button sx={{ml: "20px"}} onClick={() => navigate('/register')}>
                                    Sign Up
                                </Button>
                                <Button onClick={() => navigate('/login')}>
                                    Log In
                                </Button>
                            </Box>
                        </Box>
                    }
                </Dialog>
            </Stack>
            
            {(filmReviews.length > 0) ? 
                reviewRows()
            :
                <div>
                    <p>No reviews yet...</p>
                </div>
            }

            <Divider sx={{m: "3%"}} />

            <h3>Similar Films</h3>
            {(sameDirectorFilms.length > 0 || sameGenreFilms.length > 0) ? 
                <div> {similarFilmsRows()} </div>: <p>No similar films yet...</p>}

            <Dialog open={openDelete} onClick={handleCloseDeleteDialog}>
                <DialogTitle >Delete Film</DialogTitle>
                <DialogContent>
                    <DialogContentText >
                        Are you sure you want to delete this film: {film.title}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button variant="outlined" color="error" onClick={deleteFilm} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openEdit} onClose={handleCloseEditDialog}>
                <Box sx={{width: '600px', height: 'fit-content'}}>
                    <DialogTitle>Edit Film</DialogTitle>
                    <DialogContent>
                        <Stack direction="column" spacing={3} sx={{m: "20px"}}>
                            <TextField
                                required
                                id="title"
                                name="title"
                                label="Title"
                                defaultValue={film.title}
                                onChange={handleFormChanges("title")}
                            />

                            <TextField
                                required
                                id="description"
                                name="description"
                                label="Description"
                                defaultValue={film.description}
                                multiline rows={4}
                                onChange={handleFormChanges("description")}/>

                            <FormControl sx={{m: 1}}>
                                <InputLabel id="genre">Genre</InputLabel>
                                <Select
                                    required
                                    labelId="genre-select-label"
                                    label="genre"
                                    id="genre-select"
                                    onChange={handleFormChanges("genreId")}
                                    defaultValue={getFilmGenre(film.genreId)}
                                    MenuProps={MenuProps}>
                                    {genres.map((genre) => (
                                        <MenuItem key={genre.genreId} value={genre.name}>{genre.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {currentDate < releaseDate ?
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker minDate={dayjs().add(1, 'day')} label="Release Date"
                                                value={releaseDate}
                                                onChange={handleFormChanges("releaseDate")}/>
                                </LocalizationProvider>
                                : <Typography>Release Date: Can't change release date after it has passed.</Typography>}

                            <FormControl sx={{m: 1}}>
                                <InputLabel id="age-rating">Age Rating</InputLabel>
                                <Select
                                    labelId="age-rating-select-label"
                                    defaultValue={film.ageRating}
                                    id="age-rating-select"
                                    onChange={handleFormChanges("ageRating")}
                                    input={<OutlinedInput label="age rating" />}
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
                                    endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
                                    aria-describedby="standard-runtime-helper-text"
                                    inputProps={{
                                        'aria-label': 'runtime',
                                        min: "0"
                                    }}
                                    defaultValue={film.runtime}
                                    onChange={handleFormChanges("runtime")}
                                />
                            </FormControl>

                            <Box>
                                <Stack direction="row" spacing={3} justifyContent="center">
                                    <p>Upload a new image: </p>
                                    <Button variant="outlined" color="secondary" component="label">
                                        Upload
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
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={handleCloseEditDialog}>Cancel</Button>
                        <Button type="submit" onClick={handleEditFilm}
                                disabled={(!((editFilm.title.length > 0) && (editFilm.description.length > 0)))}>
                            Change
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </ThemeProvider>
    )
}

export default Film;