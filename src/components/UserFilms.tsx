import { Alert, AlertTitle, Box, Button, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material"
import axios from "axios"
import React from "react"
import AddBoxIcon from '@mui/icons-material/AddBox';
import FilmObject from "./FilmObject"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom";
import theme from "../theme";

const UserFilms = () => {
    const userId = localStorage.getItem("userId")
    const [user, setUser] = React.useState<UserReturn>({
        firstName: "",
        lastName: ""
    })

    const [reviewedFilms, setReviewedFilms] = React.useState<Array<FilmFull>>([])
    const [films, setFilms] = React.useState<Array<FilmFull>>([])
    const [genres, setGenres] = React.useState<Array<Genre>>([])

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const navigate = useNavigate()

    const getFilmGenre = (genreId: number) => {
        const filmGenre = genres.find(genre => genre.genreId === genreId)
        if (filmGenre) {
            return filmGenre.name
        } else {
            return "NULL"
        }
    }

    const reviewedFilmsRows = () => {
        if (reviewedFilms.length > 0) {
            return reviewedFilms.map((film: Film) => (
                <FilmObject key={film.filmId} film={film} genre={getFilmGenre(film.genreId)}/>
            ))
        } else {
            return (
                <p>Haven't reviewed any films yet...</p>
            )
        }
    }

    const filmRows = () => {
        if (films.length > 0) {
            return films.map((film: Film) => (
                <FilmObject key={film.filmId} film={film} genre={getFilmGenre(film.genreId)}/>
            ))
        } else {
            return (
                <p>No films yet...</p>
            )
        }
    }

    React.useEffect(() => {
        const getUser = () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}`)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUser(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }

        const getFilms = () => {
            let filmQuery = `http://localhost:4941/api/v1/films?directorId=${userId}&start=0`
            axios.get(filmQuery)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilms(response.data.films)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }

        const getReviewedFilms = () => {
            let filmQuery = `http://localhost:4941/api/v1/films?reviewerId=${userId}&start=0`
            axios.get(filmQuery)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setReviewedFilms(response.data.films)
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

        getUser()
        getFilms()
        getGenres()
        getReviewedFilms()
    }, [userId])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {Navbar()}
            {errorFlag?
                <Alert severity = "error">
                    <AlertTitle> Error </AlertTitle>
                        { errorMessage }
                </Alert>: ""} 
            <h1>{user.firstName} {user.lastName}</h1>
            <Stack direction="row" spacing={2}
                justifyContent="center"
                divider={<Divider orientation="vertical" flexItem />}>
                <Box sx={{ width: '50%' }}>
                    <Stack direction="column">
                        <h3>FILMS</h3>
                        <Button color="secondary" variant="contained" size="small"
                            sx={{width: "fit-content", m: "auto", mb: "10px"}}
                            startIcon={<AddBoxIcon/>}
                            onClick={() => navigate('/films/create')}>
                            Add a Film
                        </Button>
                    </Stack>
                    {filmRows()}
                </Box>
                <Box sx={{ width: '50%' }}>
                    <Stack direction="column">
                        <h3>REVIEWED FILMS</h3>
                        <Button color="secondary" variant="contained" size="small"
                            sx={{width: "fit-content", m: "auto", mb: "10px"}}
                            onClick={() => navigate('/films')}>
                            Choose a film to review
                        </Button>
                    </Stack>
                    {reviewedFilmsRows()}
                </Box>
            </Stack>
        </ThemeProvider>
    )
}

export default UserFilms