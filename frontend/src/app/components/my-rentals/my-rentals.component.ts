import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { RentalAgreement } from '../../models/property.model';

@Component({
  selector: 'app-my-rentals',
  templateUrl: './my-rentals.component.html',
  styleUrls: ['./my-rentals.component.css']
})
export class MyRentalsComponent implements OnInit {
  rentals: RentalAgreement[] = [];
  loading = true;

  constructor(
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadMyRentals();
  }

  async loadMyRentals() {
    try {
      const rentalIds = await this.blockchainService.getUserRentals();
      this.rentals = [];
      
      for (const id of rentalIds) {
        const rental = await this.blockchainService.getRentalAgreement(id);
        this.rentals.push(rental);
      }
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      this.loading = false;
    }
  }

  // Nouvelles méthodes utilitaires
  getActiveRentalsCount(): number {
    return this.rentals.filter(rental => rental.isActive).length;
  }

  getCompletedRentalsCount(): number {
    return this.rentals.filter(rental => !rental.isActive).length;
  }

  getStatusClass(rental: RentalAgreement): string {
    if (rental.isActive) return 'active';
    if (rental.isCompleted && rental.depositReturned) return 'completed';
    return 'pending';
  }

  getStatusText(rental: RentalAgreement): string {
    if (rental.isActive) return 'Active';
    if (rental.isCompleted && rental.depositReturned) return 'Terminée';
    return 'En attente';
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR');
  }

  calculateDuration(startDate: number, endDate: number): string {
    const days = Math.ceil((endDate - startDate) / (24 * 60 * 60));
    return `${days} jour${days > 1 ? 's' : ''}`;
  }

  canCompleteRental(rental: RentalAgreement): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= rental.endDate;
  }

  viewProperty(propertyId: number) {
    this.router.navigate(['/property', propertyId]);
  }

  async completeRental(rentalId: number) {
    try {
      await this.blockchainService.completeRental(rentalId);
      await this.loadMyRentals(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la complétion:', error);
    }
  }
}