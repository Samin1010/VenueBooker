import fs from "fs";
import path from "path";
import { Venue } from "../entity/Venue";

// const base64String = "/Venue.webp".toString("base64");

export const DEFAULT_VENUES: Partial<Venue>[] = [
  {
    name: "Grand Ballroom",
    location: "Melbourne CBD",
    capacity: 300,
    price: 5000,
    image: "/Venue.webp",
    description: "A luxurious ballroom perfect for weddings and large events.",
    rating: 4.8,
    num_ratings: 0,
    suitabilities: ["wedding", "dinner"],
    is_featured: true,
    userId: 3
  },
  {
    name: "Riverside Pavilion",
    location: "Southbank",
    capacity: 150,
    price: 3200,
    image: "/Venue.webp",
    description: "Scenic venue with river views, ideal for parties and receptions.",
    rating: null,
    num_ratings: 0,
    suitabilities: ["birthday", "dinner"],
    is_featured: false,
    userId: 3
  },
  {
    name: "Tech Hub Conference Room",
    location: "Docklands",
    capacity: 80,
    price: 1200,
    image: "/Venue.webp",
    description: "Modern conference space equipped with the latest technology.",
    rating: 4.2,
    num_ratings: 0,
    suitabilities: ["classical music", "dinner"],
    is_featured: false,
    userId: 3
  },
  {
    name: "Garden Terrace",
    location: "Fitzroy",
    capacity: 60,
    price: 900,
    image: "/Venue.webp",
    description: "Outdoor garden venue perfect for small gatherings.",
    rating: 4.6,
    num_ratings: 0,
    suitabilities: ["birthday", "wedding"],
    is_featured: true,
    userId: 4
  },
  {
    name: "Skyline Rooftop",
    location: "Carlton",
    capacity: 120,
    price: 2500,
    image: "/Venue.webp",
    description: "Rooftop venue with stunning city skyline views.",
    rating: 4.7,
    num_ratings: 0,
    suitabilities: ["rock concert", "birthday"],
    is_featured: true,
    userId: 4
  },
  {
    name: "Industrial Loft",
    location: "Richmond",
    capacity: 100,
    price: 1800,
    image: "/Venue.webp",
    description: "Stylish industrial-style loft for creative events.",
    rating: 4.3,
    num_ratings: 0,
    suitabilities: ["rock concert", "classical music"],
    is_featured: false,
    userId: 4
  },
  {
    name: "Beachside Hall",
    location: "St Kilda",
    capacity: 200,
    price: 4000,
    image: "/Venue.webp",
    description: "Spacious venue near the beach, great for large parties.",
    rating: 4.4,
    num_ratings: 0,
    suitabilities: ["wedding", "birthday"],
    is_featured: false,
    userId: 4
  },
  {
    name: "Art Gallery Space",
    location: "Brunswick",
    capacity: 70,
    price: 1100,
    image: "/Venue.webp",
    description: "Creative gallery space for exhibitions and events.",
    rating: 4.5,
    num_ratings: 0,
    suitabilities: ["classical music", "dinner"],
    is_featured: false,
    userId: 5
  },
  {
    name: "Banquet Hall Deluxe",
    location: "Footscray",
    capacity: 250,
    price: 4500,
    image: "/Venue.webp",
    description: "Elegant banquet hall for weddings and formal events.",
    rating: 4.6,
    num_ratings: 0,
    suitabilities: ["wedding", "dinner"],
    is_featured: true,
    userId: 5
  },
  {
    name: "Cozy Meeting Room",
    location: "Hawthorn",
    capacity: 20,
    price: 300,
    image: "/Venue.webp",
    description: "Small and comfortable space for meetings and workshops.",
    rating: 4.1,
    num_ratings: 0,
    suitabilities: ["dinner", "birthday"],
    is_featured: false,
    userId: 5
  },
  {
    name: "Melbourne Tennis Club",
    location: "Prahran",
    capacity: 60,
    price: 1400,
    image: "/Venue.webp",
    description: "Outdoor tennis court with seating and catering options.",
    rating: 4.9,
    num_ratings: 0,
    suitabilities: ["tennis", "birthday"],
    is_featured: false,
    userId: 3
  },
  {
    name: "Harbor View Dinner Hall",
    location: "Docklands",
    capacity: 110,
    price: 2300,
    image: "/Venue.webp",
    description: "Waterfront dining venue ideal for dinner events and receptions.",
    rating: 4.4,
    num_ratings: 0,
    suitabilities: ["dinner", "wedding"],
    is_featured: true,
    userId: 4
  },
  {
    name: "Lakeside Concert Arena",
    location: "Albert Park",
    capacity: 320,
    price: 5200,
    image: "/Venue.webp",
    description: "Large outdoor arena suited for concerts, festivals, and live music.",
    rating: 4.7,
    num_ratings: 0,
    suitabilities: ["rock concert"],
    is_featured: true,
    userId: 5
  }
];
