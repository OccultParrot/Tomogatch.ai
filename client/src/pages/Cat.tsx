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
    <div
      className="container mx-auto p-2 bg-color_1 rounded-b-2xl"
      style={{ maxHeight: "80vh" }}
    >
      <div className="flex flex-col justify-center items-center mb-6 min-w-96">
        <div className="w-full ">
          {/* Current main image and cat */}
          <div className="flex justify-center">
            <div className="bg-color_2 rounded-lg p-4 mr-3 avatar-hover">
              <div className="relative flex justify-center mb-4 flex-basis-0">
                <img
                  src={cat.avatar}
                  alt={cat.name}
                  className="w-auto max-h-96 object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{cat.name}</h3>
                <p>
                  <strong>Mood:</strong> {cat.mood}
                </p>
                <p>
                  <strong>Patience:</strong> {cat.patience}
                </p>
              </div>
              {/* Chat button */}
              <div className="mt-4 flex justify-center items-center">
                <button
                  className="ml-2 px-4 py-2 bg-color_3 text-white rounded-lg hover:bg-color_5 transition-colors"
                  onClick={handleChatClick}
                >
                  Chat
                </button>
              </div>
            </div>
            <img
              src={currentNook}
              alt="Cat Nook"
              className="rounded-lg shadow-lg min-h-48 min-w-48 aspect-ratio"
              style={{
                aspectRatio: "1:1",
                objectFit: "cover",
                maxHeight: "36rem",
              }}
            />
          </div>

          {/* Carousel of thumbnails */}
          <div className="mt-4 flex w-full justify-center items-center space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-color_3 scrollbar-track-color_2">
            {carouselNook.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Nook ${index + 1}`}
                className="w-24 h-24 rounded-md cursor-pointer hover:border-2 border-color_5 transition-colors"
                onClick={() => setCurrentNook(image)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cat;
