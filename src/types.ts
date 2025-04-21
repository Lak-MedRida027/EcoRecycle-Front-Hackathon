import { User, Order, Product, Review } from './types';

export type UserRole = 'buyer' | 'seller' | 'guest';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  points: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Session {
  user: User;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    recyclePoints: number;
  }[];
  total: number;
  totalPoints: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  afterImageUrl: string;
  sellerId: string;
  recyclePoints: number;
  category: string;
  stock: number;
  reviews: Review[];
  averageRating: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WasteContainer {
  id: string;
  sellerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  type: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic';
  capacity: number;
  currentFillLevel: number;
  lastEmptied: string;
  status: 'operational' | 'maintenance' | 'full';
}