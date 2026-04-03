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
  isPopupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sakoon_selected_location');
    if (saved) {
      setSelectedLocation(JSON.parse(saved));
    } else {
      // Set Fremont as default location
      const defaultLocation: Location = {
        id: '1',
        name: 'Sakoon Fremont',
        address: '35700 Fremont Blvd, Fremont, CA 94536',
        phone: '(510) 744-7000'
      };
      setSelectedLocation(defaultLocation);
      localStorage.setItem('sakoon_selected_location', JSON.stringify(defaultLocation));
    }
    setIsLoading(false);
  }, []);

  const selectLocation = React.useCallback((location: Location) => {
    setSelectedLocation(location);
    localStorage.setItem('sakoon_selected_location', JSON.stringify(location));
    setIsPopupOpen(false);
  }, []);

  const clearLocation = React.useCallback(() => {
    setSelectedLocation(null);
    localStorage.removeItem('sakoon_selected_location');
  }, []);

  const value = React.useMemo(() => ({
    selectedLocation,
    selectLocation,
    clearLocation,
    isLoading,
    isPopupOpen,
    setPopupOpen: setIsPopupOpen
  }), [selectedLocation, selectLocation, clearLocation, isLoading, isPopupOpen]);

  return (
    <LocationContext.Provider value={value}>
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
