import React, { useEffect, useState, useRef, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { Upload, ShoppingBag, LogOut, Search, X, Camera, User, ShoppingCart, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { marketplaceItems, recyclingGuidelines, users } from '../lib/staticData';
import { useCart } from '../contexts/CartContext';
import CartModal from './CartModal';
import ChatBot from './ChatBot';
import axios from 'axios';

interface RecyclingResult {
  itemName: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  difficulty: string;
}

function RecyclingResultModal({ isOpen, onClose, itemName, step1, step2, step3, step4, difficulty }: { 
  isOpen: boolean; 
  onClose: () => void;
  itemName: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  difficulty: string;
}) {
  const [showFullText, setShowFullText] = useState(false);
  /* const truncatedGuideline = guideline.length > 200 ? guideline.slice(0, 200) + '...' : guideline; */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Recycling Analysis Result</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-hidden">
          <div className="flex items-center justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Identified Item</h3>
            <p className="mt-1 text-gray-600">{itemName}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Recycling Instructions</h3>
{/*             <div className={`mt-1 text-gray-600 ${showFullText ? 'overflow-y-auto max-h-[40vh] pr-2' : ''}`}>
              <p className="whitespace-pre-wrap">
                {showFullText ? guideline : truncatedGuideline}
              </p>
              {guideline.length > 200 && (
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="ml-2 text-green-600 hover:text-green-700 font-medium"
                >
                  {showFullText ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div> */}
            <div className={`mt-1 text-gray-600`}>
                <p className="whitespace-pre-wrap">
                  {step1}
                </p>
                <p className="whitespace-pre-wrap">
                  {step2}
                </p>
                <p className="whitespace-pre-wrap">
                  {step3}
                </p>
                <p className="whitespace-pre-wrap">
                  {step4}
                </p>
                <span className={`px-2 mt-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : difficulty === 'Hard'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Difficulty: {difficulty}
                  </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mt-4"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const session = auth.getSession();
  const user = session?.user;
  const userDetails = users.find(u => u.id === user?.id);

  if (!isOpen) return null;

  const joinDate = userDetails ? new Date(userDetails.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <User className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{userDetails?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-gray-900">{joinDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recycling Points</label>
            <p className="mt-1 text-green-600 font-semibold">{userDetails?.points || 0} points</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="mt-1 text-gray-900 capitalize">{userDetails?.role || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'marketplace'>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [recyclingResult, setRecyclingResult] = useState<RecyclingResult | null>(null);
  const [isRecyclingResultOpen, setIsRecyclingResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state: cart, dispatch } = useCart();

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      toast.error('Please drop an image file');
    }
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await axios.post('http://127.0.0.1:5000/classifywaste', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setRecyclingResult({
        itemName: response.data.predicted_value,
        step1: response.data.step1,
        step2: response.data.step2,
        step3: response.data.step3,
        step4: response.data.step4,
        difficulty: response.data.difficulty
      });
      setIsRecyclingResultOpen(true);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  const handleSignOut = useCallback(async () => {
    await auth.signOut();
  }, []);

  const handleSearch = useCallback((query: string) => {
    startTransition(() => {
      setSearchQuery(query);
    });
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent, item: typeof marketplaceItems[0]) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.name} added to cart`);
  }, [dispatch]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const filteredItems = marketplaceItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-green-600">EcoRecycle</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`${
                    activeTab === 'upload'
                      ? 'border-green-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Recycle Analysis
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`${
                    activeTab === 'marketplace'
                      ? 'border-green-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Marketplace
                </button>
                <button
                  onClick={() => navigate('/discover')}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Discover
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100 relative"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.items.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100"
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="sm:hidden flex space-x-4 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-center ${
                activeTab === 'upload'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500'
              }`}
            >
              <Upload className="h-5 w-5 mx-auto mb-1" />
              Recycle
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 py-2 text-center ${
                activeTab === 'marketplace'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mx-auto mb-1" />
              Shop
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="flex-1 py-2 text-center text-gray-500"
            >
              <MapPin className="h-5 w-5 mx-auto mb-1" />
              Discover
            </button>
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {recyclingResult && (
        <RecyclingResultModal
          isOpen={isRecyclingResultOpen}
          onClose={() => setIsRecyclingResultOpen(false)}
          itemName={recyclingResult.itemName}
          step1={recyclingResult.step1}
          step2={recyclingResult.step2}
          step3={recyclingResult.step3}
          step4={recyclingResult.step4}
          difficulty={recyclingResult.difficulty}
        />
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'upload' ? (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Item for Recycling Analysis</h2>
            <div className="space-y-4">
              <div
                className="relative flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors duration-200 ease-in-out hover:border-green-500"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <div className="flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-40 w-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Camera className="h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600 mt-4">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>
              {selectedImage && (
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Recycled Products Marketplace</h2>
                <div className="ml-auto relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {isPending && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item.id)}
                      className="border rounded-lg overflow-hidden transform transition duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{item.description}</p>
                        <p className="text-green-600 font-bold mt-2">${item.price.toFixed(2)}</p>
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 flex items-center justify-center"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Chat Bot Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}