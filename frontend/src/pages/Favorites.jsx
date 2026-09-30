import { Link } from "react-router-dom";
import CustomerSidebar from "../components/CustomerSidebar";
import Footer from "../components/Footer";
import { useFavorites } from "../context/FavoritesContext";
import { restaurants } from "../data/sampleData";
import RestaurantCard from "../components/RestaurantCard";

export default function Favorites() {
  const { favoriteIds } = useFavorites();
  const favoriteRestaurants = restaurants.filter((r) => favoriteIds.includes(r.id));

  return (
    <>
      <main className="customer-page">
        <CustomerSidebar />
        <section className="customer-main">
          <div className="breadcrumbs">⌂ Home 　›　 My Account 　›　 Favorites</div>
          <div className="notification-hero">
            <div>
              <span className="eyebrow">♥ SAVED FOR LATER</span>
              <h1>Favorites</h1>
              <p>Restaurants you've saved for quick reordering.</p>
            </div>
          </div>

          {favoriteRestaurants.length ? (
            <div className="qb-rest-grid">
              {favoriteRestaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          ) : (
            <div className="qb-empty">
              <span>♡</span>
              <h3>No favorites yet</h3>
              <p>Tap the heart on any restaurant to save it here.</p>
              <Link to="/restaurants" className="primary-btn" style={{ display: "inline-block", marginTop: 14 }}>
                Browse restaurants
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
