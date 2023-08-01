import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import Film from "./components/Film";
import FilmList from "./components/Films";
import RegisterUser from './components/RegisterUser';
import LoginUser from './components/LoginUser';
import UserFilms from './components/UserFilms';
import FilmCreate from './components/FilmCreate';
import User from './components/User';
import NotFound from "./components/NotFound";

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<FilmList/>}/>
            <Route path="/films" element={<FilmList/>}/>
            <Route path="/films/:id" element={<Film/>}/>
            <Route path="/films/create" element={<FilmCreate/>}/>
            <Route path="/register" element={<RegisterUser/>}/>
            <Route path="/login" element={<LoginUser/>}/>
            <Route path="/user/:id/films" element={<UserFilms/>}/>
            <Route path="/user/:id" element={<User/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
