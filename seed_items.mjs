import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const demoItems = [
  {
    title: "Canon EOS 1500D DSLR",
    description: "Perfect for campus events and photography projects. Comes with 18-55mm lens and 64GB card.",
    price_per_day: 450,
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    location: "Hostel B",
    college: "COEP Technological University",
    target_year: "All Years",
    trust_level: "Gold",
    rating: 4.8,
    reviews: 12,
    condition: "Like New",
    tags: ["camera", "dslr", "photography"]
  },
  {
    title: "Engineering Drawing Set",
    description: "Complete set with drafter, compass, and sheets. Essential for First Year students.",
    price_per_day: 50,
    category: "Study Materials",
    image_url: "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800",
    location: "Library Plaza",
    college: "PICT Pune",
    target_year: "First Year",
    trust_level: "Verified",
    rating: 4.5,
    reviews: 8,
    condition: "Good",
    tags: ["engineering", "drawing", "drafter"]
  },
  {
    title: "Mountain Bike (Hercules)",
    description: "Geared cycle for easy commute within campus and nearby areas. Well maintained.",
    price_per_day: 80,
    category: "Vehicles",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800",
    location: "Hostel C Parking",
    college: "VIT Pune",
    target_year: "All Years",
    trust_level: "Silver",
    rating: 4.2,
    reviews: 15,
    condition: "Good",
    tags: ["cycle", "bicycle", "commute"]
  },
  {
    title: "Acoustic Guitar (Yamaha)",
    description: "Great sounding guitar for practice or jam sessions. Bag included.",
    price_per_day: 150,
    category: "Musical Instruments",
    image_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800",
    location: "Music Club Room",
    college: "MIT World Peace University",
    target_year: "All Years",
    trust_level: "Verified",
    rating: 4.9,
    reviews: 5,
    condition: "Fair",
    tags: ["guitar", "music", "instrument"]
  }
];

async function seed() {
  for (const item of demoItems) {
    try {
      await addDoc(collection(db, 'items'), {
        ...item,
        owner_id: "demo-user",
        createdAt: new Date().toISOString()
      });
      console.log('Added:', item.title);
    } catch (e) {
      console.error('Error adding', item.title, e);
    }
  }
}

seed();
