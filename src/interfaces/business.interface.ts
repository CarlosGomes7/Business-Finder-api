export interface Location {
  lat: number;
  lng: number;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  businessStatus: string;
  types: string[];
  location: Location;
  hasWebsite: boolean;
  openingHours: string[];
}

export interface SearchResults {
  total: number;
  withoutWebsite: number;
  withWebsite: number;
  businesses: {
    withoutWebsite: Business[];
    withWebsite: Business[];
    all: Business[];
  };
}
