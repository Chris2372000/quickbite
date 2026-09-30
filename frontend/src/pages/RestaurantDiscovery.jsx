import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { restaurants, cuisines } from "../data/sampleData";
import RestaurantCard from "../components/RestaurantCard";
import Footer from "../components/Footer";
import CuisineIcon from "../components/CuisineIcon";

const SORTS = ["Recommended", "Rating", "Delivery time", "Delivery fee"];

export default function RestaurantDiscovery() {
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [under30, setUnder30] = useState(false);
  const [params, setParams] = useSearchParams();
  const rawQuery = (params.get("q") || "").trim();

  const filtered = useMemo(() => {
    let list = restaurants.filter((r) => {
      if (cuisine !== "All" && !r.cuisine.toLowerCase().includes(cuisine.toLowerCase())) return false;
      if (freeDeliveryOnly && r.deliveryFee > 0) return false;
      if (r.rating < minRating) return false;
      if (under30 && Math.max(...(r.deliveryTime.match(/\d+/g) || [99]).map(Number)) > 30) return false;
      if (rawQuery) {
        // every word typed must appear in the name, cuisine, tags, or any dish/category
        const hay = [r.name, r.cuisine, ...(r.tags || []), ...(r.menu || []).flatMap((sec) => [sec.category, ...sec.items.map((i) => i.name)])]
          .join(" ")
          .toLowerCase();
        if (!rawQuery.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (sort === "Rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "Delivery fee") list = [...list].sort((a, b) => a.deliveryFee - b.deliveryFee);
    if (sort === "Delivery time")
      list = [...list].sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    return list;
  }, [cuisine, sort, freeDeliveryOnly, minRating, under30, rawQuery]);

  return (
    <>
    <div className="qb-discovery">
      <div className="qb-discovery-head">
        <div>
          <h1>Restaurants near you</h1>
        </div>
        <div className="qb-discovery-sort">
          <label>Sort by</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="qb-chip-row">
        <button className={cuisine === "All" ? "on" : ""} onClick={() => setCuisine("All")}>
          All
        </button>
        {cuisines.map((c) => (
          <button key={c.name} className={cuisine === c.name ? "on" : ""} onClick={() => setCuisine(c.name)}>
            <CuisineIcon cuisine={c} size={22} /> {c.name}
          </button>
        ))}
      </div>

      <div className="qb-filter-row">
        <button
          className={freeDeliveryOnly ? "on" : ""}
          onClick={() => setFreeDeliveryOnly((v) => !v)}
        >
          Free delivery
        </button>
        <button className={minRating >= 4.5 ? "on" : ""} onClick={() => setMinRating(minRating >= 4.5 ? 0 : 4.5)}>
          ★ 4.5+
        </button>
        <button>Open now</button>
        <button className={under30 ? "on" : ""} onClick={() => setUnder30((v) => !v)}>
          Under 30 min
        </button>
        <button>Price</button>
      </div>

      <p className="qb-discovery-count">
        {filtered.length} {filtered.length === 1 ? "restaurant" : "restaurants"}
        {rawQuery && (
          <>
            {" "}for “{rawQuery}”{" "}
            <button type="button" className="qb-clear-search" onClick={() => setParams({})}>
              Clear search
            </button>
          </>
        )}
      </p>

      {filtered.length ? (
        <div className="qb-rest-grid">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="qb-empty">
          <span>🍽️</span>
          <h3>{rawQuery ? `No results for “${rawQuery}”` : "No restaurants match those filters"}</h3>
          <p>Try clearing a filter or searching a different dish or cuisine.</p>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}
