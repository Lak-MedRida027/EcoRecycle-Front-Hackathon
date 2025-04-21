import { User, Order, Product, Review, WasteContainer } from '../types';

// Load users from localStorage or use default data
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    role: 'buyer',
    createdAt: new Date().toISOString(),
    points: 0,
    location: {
      lat: 35.5543,  // Batna coordinates
      lng: 6.1739
    }
  },
  {
    id: '2',
    email: 'seller.batna@example.com',
    password: 'seller123',
    role: 'seller',
    createdAt: new Date().toISOString(),
    points: 0,
    location: {
      lat: 35.5543,  // Batna
      lng: 6.1739
    }
  },
  {
    id: '3',
    email: 'seller.khenchela@example.com',
    password: 'eco123',
    role: 'seller',
    createdAt: new Date().toISOString(),
    points: 0,
    location: {
      lat: 35.4317,  // Khenchela
      lng: 7.1453
    }
  },
  {
    id: '4',
    email: 'seller.oran@example.com',
    password: 'green123',
    role: 'seller',
    createdAt: new Date().toISOString(),
    points: 0,
    location: {
      lat: 35.6987,  // Oran
      lng: -0.6349
    }
  }
];

const savedUsers = localStorage.getItem('users');
export const users: User[] = savedUsers ? JSON.parse(savedUsers) : defaultUsers;

export const saveUsers = () => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Static reviews data
export const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: '1',
    userEmail: 'demo@example.com',
    rating: 5,
    comment: 'Great eco-friendly notebook! The paper quality is excellent.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    productId: '2',
    userId: '1',
    userEmail: 'demo@example.com',
    rating: 4,
    comment: 'Very durable water bottle. Keeps drinks cold for hours.',
    createdAt: new Date().toISOString()
  }
];

// Initialize marketplace items from localStorage or use default data
const defaultMarketplaceItems: Product[] = [
  {
    id: '1',
    name: 'Recycled Paper Notebook',
    description: 'Handcrafted notebook made from 100% recycled paper. Each purchase helps save trees and reduces paper waste. Perfect for eco-conscious writers and artists.',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41',
    afterImageUrl: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c',
    sellerId: '2',
    recyclePoints: 50,
    category: 'Stationery',
    stock: 100,
    reviews: reviews.filter(review => review.productId === '1'),
    averageRating: 5
  }
];

const savedMarketplaceItems = localStorage.getItem('marketplaceItems');
export const marketplaceItems: Product[] = savedMarketplaceItems 
  ? JSON.parse(savedMarketplaceItems) 
  : defaultMarketplaceItems;

export const saveMarketplaceItems = () => {
  localStorage.setItem('marketplaceItems', JSON.stringify(marketplaceItems));
};

// Load orders from localStorage or use default empty array
const savedOrders = localStorage.getItem('orders');
export const orders: Order[] = savedOrders ? JSON.parse(savedOrders) : [];

export const saveOrders = () => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Static recycling guidelines
export const recyclingGuidelines: Record<string, string> = {
  'plastic-bottle': 'Clean and place in plastic recycling bin',
  'paper': 'Place in paper recycling bin',
  'glass': 'Clean and place in glass recycling bin',
  'metal': 'Place in metal recycling bin',
  'default': 'Please consult your local recycling guidelines',
};

// Static waste containers data
export const wasteContainers: WasteContainer[] = [
  {
    id: '1',
    sellerId: '2',
    location: {
      lat: 35.5543,
      lng: 6.1739,
      address: 'Route de Tazoult, Batna, Algeria'
    },
    type: 'plastic',
    capacity: 1000,
    currentFillLevel: 750,
    lastEmptied: '2024-03-10T10:00:00Z',
    status: 'operational'
  },
  {
    id: '2',
    sellerId: '3',
    location: {
      lat: 35.4317,
      lng: 7.1453,
      address: 'Centre Ville, Khenchela, Algeria'
    },
    type: 'paper',
    capacity: 800,
    currentFillLevel: 720,
    lastEmptied: '2024-03-09T14:30:00Z',
    status: 'full'
  },
  {
    id: '3',
    sellerId: '4',
    location: {
      lat: 35.6987,
      lng: -0.6349,
      address: 'Front de Mer, Oran, Algeria'
    },
    type: 'glass',
    capacity: 500,
    currentFillLevel: 200,
    lastEmptied: '2024-03-11T09:15:00Z',
    status: 'operational'
  }
];