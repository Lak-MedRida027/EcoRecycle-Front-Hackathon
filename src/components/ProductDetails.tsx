import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Award, User } from 'lucide-react';
import { marketplaceItems } from '../lib/staticData';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { auth } from '../lib/auth';
import { users } from '../lib/staticData';
import ProductReviews from './ProductReviews';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const user = auth.getSession()?.user;

  const product = marketplaceItems.find(item => item.id === id);
  const seller = users.find(user => user.id === product?.sellerId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (user?.role === 'guest') {
      toast.error('Please sign up to access the marketplace');
      return;
    }
    
    if (quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      dispatch({ type: 'ADD_ITEM', payload: product });
    }
    toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={product.imageUrl}
                  alt={`${product.name} before recycling`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">Before Recycling</p>
              </div>
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={product.afterImageUrl}
                  alt={`${product.name} after recycling`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">After Recycling</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-lg text-green-600 font-semibold mt-2">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-5 w-5" />
                <span>Seller: {seller?.email || 'Unknown Seller'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">
                  Earn {product.recyclePoints} recycling points
                </span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Stock</h2>
                <p className="mt-2 text-gray-600">{product.stock} units available</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-gray-700">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.stock))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 border-t">
            <ProductReviews
              productId={product.id}
              reviews={product.reviews}
              averageRating={product.averageRating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}