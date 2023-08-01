import React from 'react'
import {
    Avatar,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Rating,
    Stack,
    Typography
} from "@mui/material";
import CSS from 'csstype';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const cardStyle: CSS.Properties = {
    display: "inline-block",
    height: "fit-content",
    width: "350px",
    margin: "10px",
    backgroundColor: "#1e1e1e"
}

interface IFilmProps {
    film: Film,
    genre: string
}

const FilmObject = (props: IFilmProps) => {
    const [film] = React.useState<Film>(props.film)
    const navigate = useNavigate();
    const [imageURL, setImageURL] = React.useState(`http://localhost:4941/api/v1/films/${film.filmId}/image`)
    const directorImage = `http://localhost:4941/api/v1/users/${film.directorId}/image`
    const [imageErrorFlag, setImageErrorFlag] = React.useState(false)
    const filmURL = `/films/${film.filmId}`

    React.useEffect(() => {
        const getImage = () => {
            axios.get(imageURL)
                .then(() => {
                    setImageURL("")
                    setImageErrorFlag(false)
                    setImageURL(`http://localhost:4941/api/v1/films/${film.filmId}/image`)
                }, () => {
                    setImageErrorFlag(true)
                })
        }
        getImage()
    }, [imageURL, film, setImageURL])

    return (
        <Card sx={cardStyle}>
            <CardHeader title={film.title}/>
            <CardActionArea onClick={() => navigate(filmURL)}>
                {imageErrorFlag ?
                    <CardMedia component="img"
                        height="300"
                        width="300"
                        sx={{objectFit:"cover"}}
                        image={"/noImageFound.png"}
                        alt={film.title} />
                :
                    <CardMedia component="img"
                        height="300"
                        width="300"
                        sx={{objectFit:"cover"}}
                        image={imageURL}
                        alt={film.title} />
                }
                <CardContent>
                    <p>Release Date: {new Date(film.releaseDate).toLocaleDateString()}</p>
                    <p>Age Rating: {film.ageRating}</p>
                    <p>Genre: {props.genre}</p>
                    <Stack direction="row" justifyContent="center" sx={{mt: "-12px"}}>
                        <p>Rating: </p>
                        <Rating name="rating" sx={{ml: "5px", mt:"12px"}}
                            max={10} defaultValue={film.rating}
                            precision={0.2} size="small" readOnly/>
                    </Stack>
                    <Stack direction="row" justifyContent="center" sx={{m: 1}}>
                        <Typography sx={{m: "auto"}}>
                            Directed by {film.directorFirstName} {film.directorLastName}
                        </Typography>
                        <Avatar alt={film.directorFirstName} src={directorImage} />
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default FilmObject