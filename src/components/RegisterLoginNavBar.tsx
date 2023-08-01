import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { useNavigate } from 'react-router-dom';

const RegisterLoginNavbar = () => {
    const navigate = useNavigate()
    const authToken = localStorage.getItem('token')

    const handleLogOut = () => {
        localStorage.removeItem('user')
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
                                onClick={handleLogOut}
                                sx={{ my: 2, color: 'white', display: 'block', margin: '10px'}}>
                                Log Out
                            </Button>
                        </Box>
                    : "" }
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default RegisterLoginNavbar;
