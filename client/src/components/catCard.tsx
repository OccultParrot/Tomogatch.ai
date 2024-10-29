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
      className="border-2 flex flex-col items-center p-4 rounded-lg cursor-pointer"
      onClick={onClick}
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
        <p className="w-auto text-gray-900 bg-color_2 rounded m-1 px-4 py-2">Mood: {cat.mood}</p>
      )}
    </div>
  );
};

export default CatCard;
