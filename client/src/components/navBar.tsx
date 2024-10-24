import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import AuthService from '../utils/auth'
import { useNavigate } from "react-router-dom";

function NavBar() {
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    const checkLoggedIn = () => {
        if (AuthService.loggedIn()) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const handleLogin = () => {
        navigate("/Login");
    }

    const handleLogout = () => {
        AuthService.logout();
        setLoggedIn(false);
        navigate("/");
    }

    return (
        <nav className="bg-color_2 w-full flex p-4 top-0 left-0">
            <div className="container mx-auto flex justify-between items-center">
                <Link to='/' className="flex items-center space-x-2">
                    <img src="assets/logo.png" alt="Cat Logo" className="h-10 w-30"/>
                </Link>
                <div>
                    {loggedIn ? (
                        <button 
                            className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                            onClick={handleLogout}>
                                Logout
                            </button>
                    ) : (
                        <button 
                            className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                            onClick={handleLogin}>
                                Login
                            </button>
                        // <button className="bg-yellow-500 text-black px-4 py-2 rounded" onClick={handleLogin}>Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;