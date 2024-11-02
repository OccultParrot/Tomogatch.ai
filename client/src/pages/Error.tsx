import { FC } from "react";
// import notFoundImage from "./assets/CatLady.png"; // Cant seem to find the image after building

const ErrorPage: FC = () => {
    return (
        <div className='bg-gray-400 min-h-screen'>
            <img src="assets/other/CatLady.png" alt="Not found, Cat Lady Error image"/>
            {/* <h1>Oops!</h1>
            <p>An error has occurred!</p>
            <p>We're sorry for the inconvenience. Please try again later.</p> */}
        </div>
    );
};

export default ErrorPage;
