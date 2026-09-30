import { Link } from "react-router-dom";
import { restaurants, cuisines, popularDishes } from "../data/sampleData";
import RestaurantCard from "../components/RestaurantCard";
import Footer from "../components/Footer";
import CuisineIcon from "../components/CuisineIcon";

export default function Landing() {
  const featured = restaurants.slice(0, 3);
  const nearYou = restaurants.slice(3);
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <>
    <div className="qb-landing">
      <section className="qb-hero">
        <div className="qb-hero-copy">
          <p className="eyebrow">QUICKBITE · DELIVERED FRESH</p>
          <h1>
            Delicious food, <span>delivered to your door.</span>
          </h1>
          <p className="qb-hero-sub">
            Order from the best local restaurants — hot, fresh, and at your door in as
            little as 20 minutes.
          </p>
          <form className="qb-hero-search" onSubmit={(e) => e.preventDefault()}>
            <span>📍</span>
            <input placeholder="Your delivery address" />
            <Link to="/restaurants" className="primary-btn">
              Find food
            </Link>
          </form>
          <div className="qb-hero-stats">
            <div>
              <strong>1,200+</strong>
              <span>Restaurant partners</span>
            </div>
            <div>
              <strong>4.8★</strong>
              <span>Average rating</span>
            </div>
            <div>
              <strong>20 min</strong>
              <span>Avg. delivery time</span>
            </div>
          </div>
        </div>
        <div className="qb-hero-img" style={{ backgroundImage: "url(/images/hero/hero.jpg)" }} />
      </section>

      <section className="qb-section">
        <h2>Popular cuisines</h2>
        <div className="qb-cuisine-row">
          {cuisines.map((c) => (
            <Link key={c.name} to="/restaurants" className="qb-cuisine-pill">
              <CuisineIcon cuisine={c} size={40} />
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-section-head">
          <h2>Featured restaurants</h2>
          <Link to="/restaurants">See all →</Link>
        </div>
        <div className="qb-rest-grid">
          {featured.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      <section className="qb-section qb-offers">
        <div className="qb-offer-card">
          <div>
            <p className="eyebrow">LIMITED TIME</p>
            <h3>20% off your first 3 orders</h3>
            <p>Use code QUICKBITE20 at checkout.</p>
          </div>
          <Link to="/restaurants" className="primary-btn">
            Order now
          </Link>
        </div>
        <div className="qb-offer-card alt">
          <div>
            <p className="eyebrow">FREE DELIVERY</p>
            <h3>On orders over $25</h3>
            <p>Available at select restaurants near you.</p>
          </div>
          <Link to="/restaurants" className="primary-btn">
            Browse
          </Link>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-section-head">
          <h2>Restaurants near you</h2>
          <Link to="/restaurants">See all →</Link>
        </div>
        <div className="qb-rest-grid">
          {nearYou.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      <section className="qb-section">
        <h2>Popular dishes</h2>
        <div className="qb-dish-row">
          {popularDishes.map((d) => (
            <div key={d.name} className="qb-dish-chip">
              <div className="qb-dish-chip-img" style={{ backgroundImage: `url(${d.image})` }} />
              <div>
                <b>{d.name}</b>
                <span>{d.restaurant}</span>
                <em>${d.price.toFixed(2)}</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-section-head">
          <h2>Highly rated near you</h2>
          <Link to="/restaurants">See all →</Link>
        </div>
        <div className="qb-rest-grid">
          {topRated.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
