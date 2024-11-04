import { useState, useEffect } from "react";
import { Image } from "@thatapicompany/thecatapi/dist/types";
import CatPolaroid from "../components/catPolaroid.tsx";
// import YarnConnection from "../components/yarnConnection.tsx";
import fetchCatPictures from "../utils/fetchCatPictures.ts";

const Landing = () => {
  const [catApiPhotos, setCatApiPhotos] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const corkboardBackground = "./assets/other/CorkBoard.png";
  const adoptionBanner = "./assets/other/CATGPT-AdoptionBanner.png";

  useEffect(() => {
    const loadCatPhotos = async () => {
      try {
        const photos = await fetchCatPictures(4, "small");
        setCatApiPhotos(photos);
      } catch (error) {
        console.error("Error fetching cat photos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatPhotos();
  }, []);

  // Making a set of coordinates for each picture in the picture array
  const randomPosition = (index: number) => {
    // Ensure positions stay within 20-80% of container
    const edgeLimit = (value: number) => Math.min(Math.max(value, 20), 60);

    // Calculate grid position (2x3 grid)
    const row = Math.floor(index / 2);
    const col = index % 2;

    // Base position at center of grid cell
    const baseLeft = 25 + col * 50; // 25% spacing between columns
    const baseTop = 20 + row * 30; // 20% spacing between rows

    // Add controlled randomness within the cell
    const randomOffset = () => (Math.random() - 0.5) * 15; // ±7.5% random offset

    return {
      top: edgeLimit(baseTop + randomOffset()),
      left: edgeLimit(baseLeft + randomOffset()),
    };
  };

  const catApiPercentCoordinates = catApiPhotos.map((_, index) =>
    randomPosition(index)
  );

  if (isLoading) {
    return (
      <div className="relative bg-color_1 min-h-screen p-4 gap-4 flex justify-start items-center -z-30 flex-col">
        <img
          src={adoptionBanner}
          alt="Banner - Cat GPT Adoption Board"
          className="max-w-5xl margin-auto"
        />
        <div className="relative w-full max-w-5xl h-[600px] bg-color_1 rounded-lg -z-20">
          <img
            src={corkboardBackground}
            className="w-full h-full -z-10 relative"
            alt="Corkboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-color_1 min-h-screen p-4 gap-4 flex justify-start items-center -z-30 flex-col">
      <img
        src={adoptionBanner}
        alt="Banner - Cat GPT Adoption Board"
        className="w-auto lg:max-w-4xl margin-auto"
      />
      <div className="relative w-full max-w-5xl h-[600px] bg-color_1 rounded-lg -z-20">
        <img
          src={corkboardBackground}
          className="w-full h-full -z-10 relative"
          alt="Corkboard"
        />
        {/* Render yarn connections */}
        {/*{catApiPercentCoordinates.map((coordinate, index) => {*/}
        {/*  const nextCoordinate =*/}
        {/*    catApiPercentCoordinates[*/}
        {/*    (index + 1) % catApiPercentCoordinates.length*/}
        {/*      ];*/}
        {/*  return (*/}
        {/*    <YarnConnection*/}
        {/*      key={index}*/}
        {/*      startCoordinate={coordinate}*/}
        {/*      endCoordinate={nextCoordinate}*/}
        {/*      segmentLength={10}*/}
        {/*      // TODO: Find a picture for yarn*/}
        {/*      yarnUrl=""*/}
        {/*    />*/}
        {/*  );*/}
        {/*})}*/}

        {/* Render the cat photos */}
        {catApiPhotos.map((photo, index) => (
          <div key={index}>
            <CatPolaroid
              index={index}
              photoURL={photo.url}
              topPercent={`${catApiPercentCoordinates[index].top}%`}
              leftPercent={`${catApiPercentCoordinates[index].left}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
