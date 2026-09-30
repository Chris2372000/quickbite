import { useState } from "react";
import { dishVisual } from "../data/orderMeta";

// Shows the dish photo if we have one; falls back to an emoji tile so nothing breaks
// when an image file is missing.
export default function DishThumb({ name, size = 56, radius = 12 }) {
  const { src, emoji } = dishVisual(name);
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: radius };

  if (!src || failed) {
    return (
      <span className="qb-thumb qb-thumb-fallback" style={{ ...style, fontSize: size * 0.45 }}>
        {emoji}
      </span>
    );
  }
  return <img className="qb-thumb" style={style} src={src} alt={name} onError={() => setFailed(true)} />;
}
