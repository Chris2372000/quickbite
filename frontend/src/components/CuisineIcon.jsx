import { useState } from "react";

// Cuisine picture with an emoji fallback, so a missing file never shows a broken image or a path.
export default function CuisineIcon({ cuisine, size = 24 }) {
  const [failed, setFailed] = useState(false);
  if (!cuisine.icon || failed) {
    return <span className="qb-cuisine-emoji" style={{ fontSize: size * 0.85 }}>{cuisine.emoji}</span>;
  }
  return (
    <img
      className="qb-cuisine-img"
      src={cuisine.icon}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
