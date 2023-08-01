import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate()
    const userId = localStorage.getItem("userId")
    const authToken = localStorage.getItem("token")

    const handleLogOut = () => {
        // axios.post("http://localhost:4941/api/v1/users/logout",
        //     {headers: {'X-Authorization': localStorage.getItem('token')}})
        //     .then((response) => {
        //     }, (error) => {
        //         console.log(error.toString())
        //     })
        localStorage.removeItem('userId')
        localStorage.removeItem('token')
        navigate('/films')
    }

    return (
        <AppBar position="static" sx={{backgroundColor: 'hotpink'}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <TheaterComedyIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'white',
                            textDecoration: 'none',
                        }}>
                        Film Festival 365
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            onClick={() => navigate('/films')}
                            sx={{ my: 2, color: 'white', display: 'block' }}>
                            Films
                        </Button>
                    </Box>

                    {authToken ? 
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'end' }}>
                            <Button
                                onClick={() => navigate(`/user/${userId}/films`)}
                                sx={{ my: 2, color: 'white', display: 'block', margin: "10px"}}>
                                My Films
                            </Button>
                            <Button
                                onClick={() => navigate(`/user/${userId}`)}
                                sx={{ my: 2, color: 'white', display: 'block', margin: "10px"}}>
                                Account
                            </Button>
                            <Button
                                onClick={handleLogOut}
                                sx={{ my: 2, color: 'white', display: 'block', margin: "10px"}}>
                                Log Out
                            </Button>
                        </Box>
                    :
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'end' }}>
                            <Button
                                onClick={() => navigate('/register')}
                                sx={{ my: 2, color: 'white', display: 'block'}}>
                                Sign Up
                            </Button>

                            <Button
                                onClick={() => navigate('/login')}
                                sx={{ my: 2, color: 'white', display: 'block', margin: '10px'}}>
                                Log In
                            </Button>
                        </Box>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}

// @ts-ignore
export default Navbar;