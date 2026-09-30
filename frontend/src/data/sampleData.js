

export const cuisines = [
  { name: "Pizza", icon: "/images/cuisines/pizza.png", emoji: "🍕" },
  { name: "Burgers", icon: "/images/cuisines/burger.png", emoji: "🍔" },
  { name: "Sushi", icon: "/images/cuisines/sushi.png", emoji: "🍣" },
  { name: "Tacos", icon: "/images/cuisines/tacos.png", emoji: "🌮" },
  { name: "Ramen", icon: "/images/cuisines/ramen.png", emoji: "🍜" },
  { name: "Salads", icon: "/images/cuisines/salade.png", emoji: "🥗" },
  { name: "Desserts", icon: "/images/cuisines/banane-split.png", emoji: "🍨" },
  { name: "Coffee", icon: "/images/cuisines/coffee.png", emoji: "☕" },
];

export const restaurants = [
  {
    id: "the-famous",
    name: "THE FAMOUS",
    cuisine: "Modern American · Burgers",
    rating: 5.8,
    reviews: 612,
    deliveryTime: "20-30 min",
    deliveryFee: 25.000,
    priceRange: "FCFA",
    promo: "20% OFF",
    tags: ["Free delivery over $25"],
    image: "/images/restaurants/famous.webp",
    logo: "/images/restaurants/falogo.jpg",
    address: "VGV9+37W, Unnamed Road, Yaoundé",
    hours: "12:00 AM – 10:00 PM",
    minOrder: 12,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "smash-burger",
            name: "Double Smash Burger",
            description: "Two smashed patties, aged cheddar, pickles, burger sauce, brioche bun.",
            price: 13.5,
            rating: 4.9,
            image: "/images/orders/smash-burger.jpg",
            sizes: [
              { name: "Regular", priceDelta: 0 },
              { name: "Double Stack", priceDelta: 3.5 },
            ],
            extras: [
              { name: "Bacon", priceDelta: 1.5 },
              { name: "Extra cheese", priceDelta: 1.0 },
              { name: "Fried egg", priceDelta: 1.5 },
            ],
          },
          {
            id: "truffle-fries",
            name: "Truffle Parmesan Fries",
            description: "Hand-cut fries, truffle oil, shaved parmesan, chives.",
            price: 7.0,
            rating: 4.7,
            image: "/images/orders/fries.jpg",
          },
        ],
      },
      {
        category: "Starters",
        items: [
          {
            id: "charred-wings",
            name: "Charred Wings",
            description: "Smoked and charred, tossed in honey-chili glaze.",
            price: 10.5,
            rating: 4.6,
            image: "/images/orders/charred-wings.jpg",
          },
        ],
      },
      {
        category: "Mains",
        items: [
          {
            id: "oak-steak",
            name: "Oak-Fired Ribeye",
            description: "10oz ribeye, herb butter, roasted garlic mash.",
            price: 26.0,
            rating: 4.9,
            image: "/images/orders/oak-steak.jpg",
          },
        ],
      },
      {
        category: "Drinks",
        items: [
          {
            id: "smoked-lemonade",
            name: "Smoked Lemonade",
            description: "House lemonade, charred lemon, mint.",
            price: 4.5,
            rating: 4.5,
            image: "/images/orders/smokedlemonade.jpg",
          },
        ],
      },
      {
        category: "Desserts",
        items: [
          {
            id: "burnt-cheesecake",
            name: "Basque Burnt Cheesecake",
            description: "Caramelized top, silky center, berry compote.",
            price: 8.0,
            rating: 4.8,
            image: "/images/orders/burnt-cheesecake.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "chez wo",
    name: "Chez Wou",
    cuisine: "Japanese · Ramen · Sushi",
    rating: 4.7,
    reviews: 448,
    deliveryTime: "25-35 min",
    deliveryFee: 2.49,
    priceRange: "$$",
    tags: ["New"],
    image: "/images/restaurants/Chezwo.jpg",
    logo: "/images/restaurants/woulogo.jpg",
    address: "88 Maple Street, Midtown",
    hours: "11:30 AM – 9:30 PM",
    minOrder: 15,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "tonkotsu-ramen",
            name: "Tonkotsu Ramen",
            description: "18-hour pork broth, chashu, ajitama egg, scallion.",
            price: 15.0,
            rating: 4.9,
            image: "/images/orders/ramen.jpg",
            sizes: [
              { name: "Regular", priceDelta: 0 },
              { name: "Large", priceDelta: 3.0 },
            ],
            extras: [
              { name: "Extra chashu", priceDelta: 2.5 },
              { name: "Extra egg", priceDelta: 1.5 },
              { name: "Corn", priceDelta: 1.0 },
            ],
          },
        ],
      },
      {
        category: "Starters",
        items: [
          {
            id: "gyoza",
            name: "Pan-Fried Gyoza (6pc)",
            description: "Pork and cabbage dumplings, ponzu dip.",
            price: 7.5,
            rating: 4.6,
            image: "/images/orders/gyoza.jpg",
          },
        ],
      },
      {
        category: "Sides",
        items: [
          {
            id: "seaweed-salad",
            name: "Seaweed Salad",
            description: "Sesame-marinated wakame.",
            price: 5.0,
            rating: 4.4,
            image: "/images/orders/seaweed-salad.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "lecolisee",
    name: "Le Colisée",
    cuisine: "Mexican · Tacos ",
    rating: 4.6,
    reviews: 389,
    deliveryTime: "15-25 min",
    deliveryFee: 0,
    priceRange: "$",
    promo: "Free delivery",
    tags: ["Free delivery"],
    image: "/images/restaurants/lecolisee.jpeg",
    logo: "/images/restaurants/lelogo.jpeg",
    address: "215 Palm Court, Riverside",
    hours: "10:00 AM – 11:00 PM",
    minOrder: 10,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "al-pastor-tacos",
            name: "Al Pastor Tacos (3pc)",
            description: "Marinated pork, pineapple, cilantro, onion, corn tortilla.",
            price: 9.0,
            rating: 4.8,
            image: "/images/orders/al-pastor-tacos.jpeg",
          },
        ],
      },
      {
        category: "Mains",
        items: [
          {
            id: "birria-quesadilla",
            name: "Birria Quesadilla",
            description: "Slow-braised beef, melted oaxaca cheese, consommé.",
            price: 12.0,
            rating: 4.9,
            image: "/images/orders/birria-quesadilla.jpeg",
          },
        ],
      },
      {
        category: "Drinks",
        items: [
          {
            id: "horchata",
            name: "Horchata",
            description: "House-made rice and cinnamon horchata.",
            price: 3.5,
            rating: 4.7,
            image: "/images/orders/horchata.jpeg",
          },
        ],
      },
    ],
  },
  {
    id: "la cantine",
    name: "La Cantine",
    cuisine: "Healthy · Salads",
    rating: 4.5,
    reviews: 267,
    deliveryTime: "20-30 min",
    deliveryFee: 1.49,
    priceRange: "$$",
    tags: [],
    image: "/images/restaurants/LaCantine.jpg",
    logo: "/images/restaurants/Lalogo.jpg",
    address: "77 Fitness Row, Uptown",
    hours: "8:00 AM – 8:00 PM",
    minOrder: 10,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "harvest-bowl",
            name: "Harvest Grain Bowl",
            description: "Farro, roasted squash, kale, feta, tahini dressing.",
            price: 12.5,
            rating: 4.7,
            image: "/images/orders/HarvestGrainBowl.jpeg",
          },
        ],
      },
    ],
  },
  {
    id: "dolcezza",
    name: "Dolcezza",
    cuisine: "Italian · Pizza",
    rating: 4.8,
    reviews: 731,
    deliveryTime: "25-35 min",
    deliveryFee: 1.99,
    priceRange: "$$",
    promo: "Buy 1 Get 1",
    tags: ["Promo"],
    image: "/images/restaurants/Dolcezza.jpg",
    logo: "/images/restaurants/dologo.jpg",
    address: "9 Trattoria Lane, Little Italy",
    hours: "11:00 AM – 11:00 PM",
    minOrder: 15,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "margherita",
            name: "Margherita Pizza",
            description: "San Marzano tomato, fior di latte, basil, olive oil.",
            price: 14.0,
            rating: 4.9,
            image: "/images/orders/MargheritaPizza.jpeg",
          },
        ],
      },
    ],
  },
  {
    id: "seven hills",
    name: "Seven Hills",
    cuisine: "Chinese",
    rating: 4.4,
    reviews: 198,
    deliveryTime: "30-40 min",
    deliveryFee: 2.99,
    priceRange: "$",
    tags: [],
    image: "/images/restaurants/seven.jpg",
    logo: "/images/restaurants/selogo.jpg",
    address: "150 Canton Ave, Chinatown",
    hours: "11:00 AM – 10:00 PM",
    minOrder: 12,
    menu: [
      {
        category: "Popular",
        items: [
          {
            id: "kung-pao-chicken",
            name: "Kung Pao Chicken",
            description: "Diced chicken, peanuts, dried chili, scallion.",
            price: 11.5,
            rating: 4.5,
            image: "/images/orders/KungPaoChicken.jpg",
          },
        ],
      },
    ],
  },
];

export function getRestaurant(id) {
  return restaurants.find((r) => r.id === id);
}

export const popularDishes = [
  { name: "Double Smash Burger", restaurant: "Ember & Oak Grill", price: 13.5, image: "/images/orders/smash-burger.jpg" },
  { name: "Tonkotsu Ramen", restaurant: "Sakura Ramen House", price: 15.0, image: "/images/orders/ramen.jpg" },
  { name: "Birria Quesadilla", restaurant: "Casa Verde Tacos", price: 12.0, image: "/images/orders/birria-quesadilla.jpeg" },
  { name: "Margherita Pizza", restaurant: "Bella Notte Pizzeria", price: 14.0, image: "/images/orders/MargheritaPizza.jpeg" },
];
