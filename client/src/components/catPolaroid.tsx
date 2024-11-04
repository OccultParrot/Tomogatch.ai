import { Link } from "react-router-dom";

const randomRotation = () => Math.floor(Math.random() * 21) - 10; // Random angle between -10 and 10 degrees

const adoptionPin = "/assets/other/AdoptionPin.png";

interface Props {
  index: number;
  photoURL: string;
  topPercent: string | "50%";
  leftPercent: string | "50%";
}

function CatPolaroid(props: Props) {
  // Adjusts the pin position by subtracting a small percentage from the topPercent.
  const adjustedTopPercent = `calc(${props.topPercent} - 50px)`; // 50px for now?

  return (
    <Link
      to="/Signup"
      className="p-4  flex flex-col items-center rounded-bl rounded-br"
    >
      <img
        key={props.index}
        src={props.photoURL}
        alt={`Cat`}
        className="absolute w-32 h-32 object-cover rounded shadow-lg bg-color_2
                    sm:w-36 sm:h-36 md:h-40 md:w-40"
        style={{
          transform: `rotate(${randomRotation()}deg)`,
          top: props.topPercent,
          left: props.leftPercent,
          paddingRight: "10px",
          paddingLeft: "10px",
          paddingTop: "10px",
          paddingBottom: "45px",
        }}
      />
      <img
        src={adoptionPin}
        alt={`Adoption Pin`}
        className="absolute w-40 h-40 object-cover rounded shadow-lg"
        style={{
          top: adjustedTopPercent,
          left: props.leftPercent,
          scale: "0.1",
        }}
      />
    </Link>
  );
}

export default CatPolaroid;
