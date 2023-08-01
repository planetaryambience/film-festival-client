import React from 'react'
import {Avatar, Card, CardContent, Rating, Stack, Typography} from "@mui/material";
import CSS from 'csstype';

const userCardStyles: CSS.Properties = {
    display: "inline-block",
    margin: "10px",
    padding: "0px"
}

interface IFilmReviewProps {
    review: Review,
}

const FilmReviewObject = (props: IFilmReviewProps) => {
    const [review] = React.useState<Review>(props.review)
    const reviewerImage = `http://localhost:4941/api/v1/users/${review.reviewerId}/image`

    return (
        <Stack direction="column" sx={{width: '80%', ml: '9%'}}>
            <Card sx={userCardStyles}>
                <CardContent>
                    <Stack direction="row" justifyContent="center" sx={{m: 1}}>
                        <Avatar alt={review.reviewerFirstName} src={reviewerImage} />
                        <Typography sx={{ml: "1%", mt: "10px"}}>
                            {review.reviewerFirstName} {review.reviewerLastName}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="center" sx={{mt: "-12px"}}>
                        <Rating name="rating" sx={{m: "5px", mt:"20px"}}
                            max={10} value={review.rating}
                            precision={0.2} size="small" readOnly/>
                        <p>({review.rating}/10)</p>
                    </Stack>
                    {(review.review) ? 
                        <p>{review.review}</p>
                    :""}
                </CardContent>
            </Card>
        </Stack>
    )
}

export default FilmReviewObject