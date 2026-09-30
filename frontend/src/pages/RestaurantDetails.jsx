import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getRestaurant } from "../data/sampleData";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import FoodItemModal from "../components/FoodItemModal";

export default function RestaurantDetails() {
  const { id } = useParams();
  const restaurant = getRestaurant(id);
  const { cartItems, subtotal } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeItem, setActiveItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  if (!restaurant) return <Navigate to="/restaurants" replace />;

  const fav = isFavorite(restaurant.id);
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="qb-details">
      <div className="qb-details-cover" style={{ backgroundImage: `url(${restaurant.image})` }}>
        <Link to="/restaurants" className="qb-details-back">
          ← Back
        </Link>
        <button className={`qb-rest-fav on-cover${fav ? " on" : ""}`} onClick={() => toggleFavorite(restaurant.id)}>
          {fav ? "♥" : "♡"}
        </button>
      </div>

      <div className="qb-details-header">
        <span className="qb-rest-logo lg" style={{ backgroundImage: `url(${restaurant.logo})` }} />
        <div className="qb-details-header-info">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.cuisine}</p>
          <div className="qb-rest-meta">
            <span className="qb-rest-rating">★ {restaurant.rating}</span>
            <span>({restaurant.reviews} reviews)</span>
            <span>·</span>
            <span>{restaurant.deliveryTime}</span>
            <span>·</span>
            <span>{restaurant.deliveryFee === 0 ? "Free delivery" : `$${restaurant.deliveryFee.toFixed(2)} delivery`}</span>
          </div>
          <div className="qb-details-sub">
            <span>📍 {restaurant.address}</span>
            <span>🕒 {restaurant.hours}</span>
            <span>Min. order ${restaurant.minOrder}</span>
          </div>
        </div>
      </div>

      <div className="qb-details-tabs">
        {restaurant.menu.map((section, i) => (
          <button
            key={section.category}
            className={activeCategory === i ? "on" : ""}
            onClick={() => setActiveCategory(i)}
          >
            {section.category}
          </button>
        ))}
      </div>

      <div className="qb-menu-sections">
        {restaurant.menu.map((section, i) => (
          <div
            key={section.category}
            className="qb-menu-section"
            style={{ display: activeCategory === i ? "block" : "none" }}
          >
            <h2>{section.category}</h2>
            <div className="qb-food-grid">
              {section.items.map((item) => (
                <button key={item.id} className="qb-food-card" onClick={() => setActiveItem(item)}>
                  <div className="qb-food-card-img" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="qb-food-card-body">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="qb-food-card-bottom">
                      <span>${item.price.toFixed(2)}</span>
                      <span className="qb-food-add">+</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeItem && (
        <FoodItemModal item={activeItem} restaurant={restaurant} onClose={() => setActiveItem(null)} />
      )}

      {itemCount > 0 && (
        <Link to="/cart" className="qb-floating-cart">
          <span className="qb-floating-cart-count">{itemCount}</span>
          <span>View cart</span>
          <span>${subtotal.toFixed(2)}</span>
        </Link>
      )}
    </div>
  );
}
