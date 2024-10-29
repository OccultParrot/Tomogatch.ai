import React, { useState, useEffect } from "react"; // added useEffect
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation here
import { useCatContext } from "../context/CatContext";
import { useNookContext } from "../context/NookContext";

const Cat: React.FC = () => {
  const { selectedCat } = useCatContext(); // Include setSelectedCat
  const location = useLocation(); // Access the state passed via navigation
  const navigate = useNavigate();

  // Try to use the context first; fallback to state passed via navigation
  const cat = selectedCat || location.state?.cat;
  const random = Math.ceil((Math.random() * 12) % 12);
  const [currentNook, setCurrentNook] = useState(
    `/assets/nooks/nook${random}.png`
  );
  const { setSelectedNook } = useNookContext();
  setSelectedNook(currentNook);
  // Set selected nook on component mount - this had to be done in proper react hook order
  useEffect(() => {
    setSelectedNook(currentNook);
  }, [currentNook, setSelectedNook]);

  // If no cat is found, navigate back to the home page whenever the cat or location changes
  useEffect(() => {
    if (!cat) {
      console.warn("No cat found, navigating back to home.");
      navigate("/home");
    }
  }, [cat, navigate]);

  if (!cat) return null; // Prevent the render of the component if no cat is found

  const carouselNook = [];

  for (let i = 0; i < 12; i++) {
    carouselNook[i] = `/assets/nooks/nook${i + 1}.png`;
  }

  const handleChatClick = () => {
    // const catName = cat.name.toLowerCase();
    // setSelectedCat(cat); // Might not be necessary because setSelectedCat is already called in the context from home when the cat is selected
    navigate(`/Chat`, { state: { cat } });
  };

  return (
    <div className="container mx-auto p-6 bg-color_1 rounded-b-2xl">
      <div className="flex mb-6">
        <div className="w-1/4 bg-color_2 rounded-lg p-4 mr-3">
          <img
            src={cat.avatar}
            alt={cat.name}
            className="w-full max-h-64 rounded-full shadow-lg mb-4 mr-2 bg-color_1"
          />
          <div>
            <h3 className="text-2xl font-semibold mb-2">{cat.name}</h3>
            <p>
              <strong>Mood:</strong> {cat.mood}
            </p>
            <p>
              <strong>Info 1:</strong> {cat.mood}
            </p>
            <p>
              <strong>Info 2:</strong> {cat.mood}
            </p>
            <p>
              <strong>Info 3:</strong> {cat.mood}
            </p>
          </div>
        </div>

        <div className="w-3/4">
          {/* Current main image */}
          <img
            src={currentNook}
            alt="Cat Nook"
            className="w-full max-h-64 rounded-lg shadow-lg"
          />

          {/* Carousel of thumbnails */}
          <div className="mt-4 flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-color_3 scrollbar-track-color_2">
            {carouselNook.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Nook ${index + 1}`}
                className="w-24 h-24 rounded-md cursor-pointer hover: border-2 border-color_5 transition-colors"
                onClick={() => setCurrentNook(image)}
              />
            ))}
          </div>

          {/* Chat button */}
          <div className="mt-4 space-x-4">
            <button
              className="ml-2 px-4 py-2 bg-color_3 text-white rounded-lg hover:bg-color_5 transition-colors"
              onClick={handleChatClick}
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cat;
