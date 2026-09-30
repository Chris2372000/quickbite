import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function RestaurantCard({ restaurant }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const r = restaurant;
  const fav = isFavorite(r.id);

  return (
    <Link to={`/restaurants/${r.id}`} className="qb-rest-card">
      <div className="qb-rest-card-img" style={{ backgroundImage: `url(${r.image})` }}>
        {r.promo && <span className="qb-rest-badge">{r.promo}</span>}
        <button
          className={`qb-rest-fav${fav ? " on" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(r.id);
          }}
          aria-label="Save to favorites"
        >
          {fav ? "♥" : "♡"}
        </button>
      </div>
      <div className="qb-rest-card-body">
        <div className="qb-rest-card-top">
          <span className="qb-rest-logo" style={{ backgroundImage: `url(${r.logo})` }} />
          <div>
            <h3>{r.name}</h3>
            <p>{r.cuisine}</p>
          </div>
        </div>
        <div className="qb-rest-meta">
          <span className="qb-rest-rating">★ {r.rating}</span>
          <span>·</span>
          <span>{r.deliveryTime}</span>
          <span>·</span>
          <span>{r.deliveryFee === 0 ? "Free delivery" : `$${r.deliveryFee.toFixed(2)} delivery`}</span>
          <span>·</span>
          <span>{r.priceRange}</span>
        </div>
      </div>
    </Link>
  );
}
