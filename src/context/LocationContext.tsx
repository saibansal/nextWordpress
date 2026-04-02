import React, { createContext, useContext, useState, useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface LocationContextType {
  selectedLocation: Location | null;
  selectLocation: (location: Location) => void;
  clearLocation: () => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sakoon_selected_location');
    if (saved) {
      setSelectedLocation(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const selectLocation = (location: Location) => {
    setSelectedLocation(location);
    localStorage.setItem('sakoon_selected_location', JSON.stringify(location));
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    localStorage.removeItem('sakoon_selected_location');
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, selectLocation, clearLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
