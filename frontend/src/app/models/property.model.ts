export interface Property {
  id: number;
  owner: string;
  title: string;
  description: string;
  location: string;
  pricePerDay: number;
  deposit: number;
  isAvailable: boolean;
  rentalIds: number[];
}

export interface RentalAgreement {
  id: number;
  propertyId: number;
  tenant: string;
  startDate: number;
  endDate: number;
  totalPrice: number;
  deposit: number;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  depositReturned: boolean;
}