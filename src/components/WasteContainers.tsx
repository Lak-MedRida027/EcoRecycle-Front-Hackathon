import React from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { WasteContainer } from '../types';
import { wasteContainers } from '../lib/staticData';

export default function WasteContainers() {
  const getStatusColor = (status: WasteContainer['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'maintenance':
        return 'text-yellow-600';
      case 'full':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: WasteContainer['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5" />;
      case 'full':
        return <Trash2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getFillLevelColor = (fillLevel: number, capacity: number) => {
    const percentage = (fillLevel / capacity) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Smart Waste Containers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wasteContainers.map((container) => (
          <div key={container.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trash2 className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-semibold capitalize">{container.type} Container</h3>
              </div>
              <div className={`flex items-center ${getStatusColor(container.status)}`}>
                {getStatusIcon(container.status)}
                <span className="ml-2 text-sm capitalize">{container.status}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{container.location.address}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fill Level</span>
                  <span>{Math.round((container.currentFillLevel / container.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFillLevelColor(container.currentFillLevel, container.capacity)} transition-all duration-300`}
                    style={{ width: `${(container.currentFillLevel / container.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Capacity: {container.capacity} liters</p>
                <p>Last Emptied: {new Date(container.lastEmptied).toLocaleDateString()}</p>
              </div>

              {container.status === 'full' && (
                <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
                  Schedule Collection
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}