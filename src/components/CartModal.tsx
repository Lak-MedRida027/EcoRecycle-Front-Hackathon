import React from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { auth } from '../lib/auth';
import { orders, users, marketplaceItems, saveMarketplaceItems, saveOrders, saveUsers } from '../lib/staticData';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { state, dispatch } = useCart();

  if (!isOpen) return null;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity: newQuantity },
    });
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const user = auth.getSession()?.user;
    if (!user) {
      toast.error('Please sign in to checkout');
      return;
    }

    // Calculate total points for the order
    const totalPoints = state.items.reduce((acc, item) => {
      const product = marketplaceItems.find(p => p.id === item.id);
      return acc + ((product?.recyclePoints || 0) * item.quantity);
    }, 0);

    // Create new order
    const newOrder = {
      id: (orders.length + 1).toString(),
      buyerId: user.id,
      sellerId: state.items[0].sellerId,
      items: state.items.map(item => {
        const product = marketplaceItems.find(p => p.id === item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          recyclePoints: product?.recyclePoints || 0
        };
      }),
      total: state.total,
      totalPoints,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    // Add order to orders array
    orders.push(newOrder);
    saveOrders();

    // Update buyer's points
    const buyerIndex = users.findIndex(u => u.id === user.id);
    if (buyerIndex !== -1) {
      users[buyerIndex].points = (users[buyerIndex].points || 0) + totalPoints;
      saveUsers();
      
      // Store updated points in localStorage
      const session = auth.getSession();
      if (session) {
        session.user.points = users[buyerIndex].points;
        localStorage.setItem('session', JSON.stringify(session));
      }
    }

    // Update stock
    state.items.forEach(item => {
      const productIndex = marketplaceItems.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        marketplaceItems[productIndex].stock -= item.quantity;
      }
    });
    
    // Save updated marketplace items to localStorage
    saveMarketplaceItems();
    
    toast.success(`Order placed successfully! You earned ${totalPoints} points!`);
    dispatch({ type: 'CLEAR_CART' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2" />
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {state.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => {
                const product = marketplaceItems.find(p => p.id === item.id);
                const points = (product?.recyclePoints || 0) * item.quantity;
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 border-b pb-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      <p className="text-green-600 text-sm">
                        +{points} points
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <span className="text-lg font-semibold">Total:</span>
              <p className="text-sm text-green-600">
                +{state.items.reduce((acc, item) => {
                  const product = marketplaceItems.find(p => p.id === item.id);
                  return acc + ((product?.recyclePoints || 0) * item.quantity);
                }, 0)} points
              </p>
            </div>
            <span className="text-lg text-green-600 font-bold mt-2 sm:mt-0">
              ${state.total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={state.items.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}