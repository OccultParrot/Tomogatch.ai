import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../utils/auth";
import { useLoggedIn } from "../context/LoggedInContext";

function NavBar() {
  const { loggedIn, setLoggedIn } = useLoggedIn();
  // const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // const checkLoggedIn = () => {
  //     if (AuthService.loggedIn()) {
  //     // if (true) { // Use this line if you want to work on the navBar without having to sign in all the time
  //         setLoggedIn(true);
  //     } else {
  //         setLoggedIn(false);
  //     }
  // };

  useEffect(() => {
    setLoggedIn(AuthService.loggedIn());
  }, [setLoggedIn]);

    const handleLogin = () => {
        navigate("/Login");
    }

    const handleSignup = () => {
      navigate("/Signup");
    }

    const handleLogout = () => {
        AuthService.logout();
        setLoggedIn(false);
        navigate("/");
    }

  const handleCatsNav = () => {
    navigate("/Home");
  };

  const handleProfileNav = () => {
    navigate("/Profile");
  };

  const mainLogo = "/assets/other/logo.png";
  const loggedInLogo = "/assets/other/cat-GPT-icon.png"

    return (
        <nav className="bg-color_2 w-full flex p-4 top-0 left-0">
            <div className="container mx-auto flex justify-between items-center">
                <Link to='/' className="flex items-center space-x-2">
                    <img src={loggedIn ? loggedInLogo : mainLogo} alt="Cat Logo" className="h-10 w-30"/>
                </Link>
                <div>
                    {loggedIn ? (
                      <>
                        <button
                          className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                          onClick={handleCatsNav}>
                          Cats
                        </button>
                        <button
                          className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                          onClick={handleProfileNav}>
                          Profile
                        </button>
                        <button
                          className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                          onClick={handleLogout}>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                      <button
                        className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                        onClick={handleSignup}>
                                Signup
                      </button>
                      <button
                        className="ml-2 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors"
                        onClick={handleLogin}>
                                Login
                      </button>
                      </> 
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
