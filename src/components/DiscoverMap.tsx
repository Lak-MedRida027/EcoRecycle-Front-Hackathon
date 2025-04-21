import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { users } from '../lib/staticData';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DiscoverMap() {
  const navigate = useNavigate();
  // Center on Algeria (approximately centered between Batna, Khenchela, and Oran)
  const [mapCenter] = useState<[number, number]>([35.5543, 6.1739]); // Centered on Batna

  const sellers = users.filter(user => user.role === 'seller' && user.location);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Discover Nearby Recycling Centers</h2>
            <p className="text-gray-600 mt-2">Find eco-friendly sellers in Algeria</p>
          </div>
          
          <div className="h-[600px] w-full">
            <MapContainer
              center={mapCenter}
              zoom={7} // Adjusted zoom level to show all three cities
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {sellers.map((seller) => (
                seller.location && (
                  <Marker
                    key={seller.id}
                    position={[seller.location.lat, seller.location.lng]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{seller.email}</h3>
                        <p className="text-sm text-gray-600">Recycling Center</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}