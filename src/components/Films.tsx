import axios from "axios";
import React from "react";
import CSS from "csstype";
import {Paper, AlertTitle, Alert, Stack, TextField, Button, FormControl, InputLabel, SelectChangeEvent, Select, OutlinedInput, MenuItem, ListItemText, Pagination, CssBaseline, Box} from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import FilmObject from "./FilmObject";
import Checkbox from "@mui/material/Checkbox";
import Navbar from "./Navbar";
import theme from "../theme";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
    display: "block"
}

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ageRatings = ["G", "PG", "M", "R13", "R16", "R18", "TBC"]

const FilmList = () => {
    const [films, setFilms] = React.useState<Array<Film>>([])
    const [count, setCount] = React.useState(0)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [searchQuery, setSearchQuery] = React.useState("")
    const [ageRatingFilter, setAgeRatingFilter] = React.useState<string[]>([])
    const [genres, setGenres] = React.useState<Array<Genre>>([])
    const [genreFilter, setGenreFilter] = React.useState<string[]>([])
    const [sortBy, setSortBy] = React.useState("RELEASED_ASC")
    const [pageNumber, setPageNumber] = React.useState(1)

    const handleAgeRatingChange = (event: SelectChangeEvent<typeof ageRatingFilter>) => {
        const {target: {value},} = event
        setAgeRatingFilter(typeof value === 'string' ? value.split(',') : value)
    }

    const handleGenreChange = (event: SelectChangeEvent<typeof genreFilter>) => {
        const {target: {value}} = event
        setGenreFilter(typeof value === 'string' ? value.split(',') : value)        
    }

    const handleSortChange = (event: any) => {
        setSortBy(event.target.value)
    }

    const handlePageChange = (event: any, page: number) => {
        setPageNumber(page)
        getQueryFilms(page)
    }

    const getGenreIds = () => {
        let genreIds: any = []
        genreFilter.forEach(genre => {
            let gId = genres.find(g => g.name === genre)?.genreId
            genreIds.push(gId)
        })
        return genreIds
    }

    const getFilmGenre = (genreId: number) => {
        const filmGenre = genres.find(genre => genre.genreId === genreId)
        if (filmGenre) {
            return filmGenre.name
        } else {
            return "NULL"
        }
    }

    const filmRows = () => {
        return films.map((film: Film) => (
            <FilmObject key={film.filmId} film={film} genre={getFilmGenre(film.genreId)}/>
        ))
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

    const getQueryFilms = (pageNumber: number = 1, genreIds: number[] = []) => {
        const startIndex = (pageNumber - 1) * 10
        let filmQuery = "http://localhost:4941/api/v1/films?"

        if(searchQuery.length > 0) {
            filmQuery += `q=${searchQuery}&`
        }

        if (ageRatingFilter.length > 0) {
            const ageRatingQuery = ageRatingFilter.join('&ageRatings=')
            filmQuery += `ageRatings=${ageRatingQuery}&`
        }

        if (genreIds.length > 0) {
            const genreQuery = genreIds.join('&genreIds=')
            filmQuery += `genreIds=${genreQuery}&`
        }

        // check if filmQuery already has any query params
        if (filmQuery.slice(-1) !== "&" && filmQuery.slice(-1) !== "?") {
            filmQuery += "&"
        }

        filmQuery += `sortBy=${sortBy}&count=10&startIndex=${startIndex}`
        
        axios.get(filmQuery)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFilms(response.data.films)
                setCount(response.data.count)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        const getFilms = () => {
            let filmQuery = "http://localhost:4941/api/v1/films?count=10&start=0"
            axios.get(filmQuery)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFilms(response.data.films)
                    setCount(response.data.count)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getFilms()
        getGenres()
    }, [setFilms])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {Navbar()}
            {errorFlag?
                <Alert severity = "error">
                    <AlertTitle> Error </AlertTitle>
                    { errorMessage }
                </Alert>: ""}
            <h1>FILMS</h1>
            <Paper style={card}>
                <TextField sx={{width: 610, m: 1}} id="search-bar" label="search"
                    variant="outlined" value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}/>
                <Stack direction="row" spacing={1} justifyContent="center">
                    <FormControl sx={{width: 250}}>
                        <InputLabel id="age-rating">age rating</InputLabel>
                        <Select
                            labelId="age-rating-select-label"
                            id="age-rating-select"
                            multiple
                            value={ageRatingFilter}
                            onChange={handleAgeRatingChange}
                            input={<OutlinedInput label="age rating" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}>
                            {ageRatings.map((rating) => (
                                <MenuItem key={rating} value={rating}>
                                    <Checkbox checked={ageRatingFilter.indexOf(rating) > -1} />
                                    <ListItemText primary={rating} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{width: 250}}>
                        <InputLabel id="genre">genre</InputLabel>
                        <Select
                            labelId="genre-select-label"
                            id="genre-select"
                            multiple
                            value={genreFilter}
                            onChange={handleGenreChange}
                            input={<OutlinedInput label="genre" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}>
                            {genres.map((genre) => (
                                <MenuItem key={genre.genreId} value={genre.name}>
                                    <Checkbox checked={genreFilter.indexOf(genre.name) > -1} />
                                    <ListItemText primary={genre.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="secondary"
                        onClick={() => {getQueryFilms(pageNumber, getGenreIds())}}>
                        Search
                    </Button>
                </Stack>
            </Paper>
            <Paper style={card}>
                <Stack direction="row" spacing={2} sx={{m: 1}} justifyContent="flex-start">
                    <FormControl sx={{width: 270}} size="small">
                        <InputLabel id="sort-label">sort by</InputLabel>
                        <Select defaultValue={"RELEASED_ASC"}
                            name="sort-by" id="sort-by-select"
                            label="SortBy"
                            onChange={handleSortChange}>
                            <MenuItem value={"ALPHABETICAL_ASC"}>By Title, Alphabetically (A - Z)</MenuItem>
                            <MenuItem value={"ALPHABETICAL_DESC"}>By Title, Alphabetically (Z - A)</MenuItem>
                            <MenuItem value={"RELEASED_ASC"}>Release Date (old - new)</MenuItem>
                            <MenuItem value={"RELEASED_DESC"}>Release Date (new - old)</MenuItem>
                            <MenuItem value={"RATING_ASC"}>By Rating, (low - high)</MenuItem>
                            <MenuItem value={"RATING_DESC"}>By Rating (high - low)</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="secondary"
                         onClick={() => {getQueryFilms(pageNumber, getGenreIds())}}>
                        sort
                    </Button>
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'end' }}>
                        <Pagination color="primary" variant="outlined" count={Math.ceil(count / 10)}
                            page={pageNumber} onChange={handlePageChange}/>
                    </Box>
                </Stack>
                {filmRows()}
                <Stack alignItems="center" sx={{m: 2}}>
                    <Pagination 
                        size="large" color="primary"
                        count={Math.ceil(count / 10)}
                        page={pageNumber} onChange={handlePageChange}/>
                </Stack>
            </Paper>
        </ThemeProvider>
    )
}

export default FilmList;