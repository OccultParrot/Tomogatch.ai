import React from "react";
import { CatData } from "../interfaces/CatData";

interface CatCardProps {
  cat: CatData;
  isAvailable: boolean;
  onClick: () => void;
}

const CatCard: React.FC<CatCardProps> = ({ cat, isAvailable, onClick }) => {
  return (
    <div
      className="border-2 flex flex-col items-center p-4 rounded-lg cursor-pointer avatar-hover"
      onClick={onClick}
      style={{
        height: "auto",
        backgroundImage: "linear-gradient(to bottom, #4E5340, #fff7ed)",
      }}
    >
      <img
        src={cat.avatar || "./assets/other/adoptMe.png"}
        alt={cat.name}
        className="object-cover rounded-md mb-2"
        style={{ width: "auto", maxWidth: "30%", height: "auto" }}
      />
      <h3 className="text-xl font-semibold">{cat.name}</h3>

      {isAvailable ? (
        <button className="m-1 px-4 py-2 bg-color_3 rounded-lg hover:bg-color_5 transition-colors">
          Adopt Me
        </button>
      ) : (
        <div className="flex flex-col gap-4 w-4/5">
          <p className="w-full text-color_7 bg-color_2 rounded px-4 py-2 border-2 border-color_7">
            Mood: {cat.mood}
          </p>
          <p className="w-full text-color_7 bg-color_2 rounded px-4 py-2 border-2 border-color_7">
            Last Feeding: {cat.lastFeedDate}
          </p>
        </div>
      )}
    </div>
  );
};

export default CatCard;
