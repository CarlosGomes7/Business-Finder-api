export interface Lead {
  Name: string;
  Address: string;
  Phone: string;
  Website?: string;
  Rating?: string;
  TotalRatings?: string;
  Types: string;
}

export interface ProcessedLead extends Lead {
  recommendedPackage: string;
  recommendedServices: string[];
  personalizedMessage: string;
  priority: 'high' | 'medium' | 'low';
  estimatedBudget: string;
  businessType: string;
}

export interface ServicePackage {
  name: string;
  price: number;
  description: string;
  ideal: string[];
}

export interface IAProduct {
  name: string;
  price: number;
  monthlyPrice: number;
  description: string;
  ideal: string[];
}