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
  processingId: number | null = null;

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
      
      // Trier par ID décroissant (plus récent en premier)
      this.rentals.sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      this.loading = false;
    }
  }

  getActiveRentalsCount(): number {
    return this.rentals.filter(rental => rental.isActive).length;
  }

  getCompletedRentalsCount(): number {
    return this.rentals.filter(rental => rental.isCompleted).length;
  }

  getCancelledRentalsCount(): number {
    return this.rentals.filter(rental => rental.isCancelled).length;
  }

  getStatusClass(rental: RentalAgreement): string {
    if (rental.isCancelled) return 'cancelled';
    if (rental.isActive) return 'active';
    if (rental.isCompleted) return 'completed';
    return 'pending';
  }

  getStatusText(rental: RentalAgreement): string {
    if (rental.isCancelled) return 'Annulée';
    if (rental.isActive) return 'Active';
    if (rental.isCompleted) return 'Terminée';
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
    return rental.isActive && now >= rental.endDate;
  }

  canCancelRental(rental: RentalAgreement): boolean {
    return rental.isActive;
  }

  viewProperty(propertyId: number) {
    this.router.navigate(['/property', propertyId]);
  }

  async completeRental(rentalId: number) {
    if (this.processingId) return;
    
    try {
      this.processingId = rentalId;
      await this.blockchainService.completeRental(rentalId);
      await this.loadMyRentals();
      alert('✅ Location terminée avec succès ! Le dépôt a été retourné.');
    } catch (error: any) {
      console.error('Erreur lors de la complétion:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      this.processingId = null;
    }
  }

  async cancelRental(rentalId: number) {
    if (this.processingId) return;
    
    const confirmed = confirm(
      '⚠️ Êtes-vous sûr de vouloir annuler cette location ?\n\n' +
      '• Si annulée avant la date de début : le dépôt vous sera retourné\n' +
      '• Si annulée après la date de début : le dépôt ira au propriétaire'
    );
    
    if (!confirmed) return;
    
    try {
      this.processingId = rentalId;
      await this.blockchainService.cancelRental(rentalId);
      await this.loadMyRentals();
      alert('✅ Location annulée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      this.processingId = null;
    }
  }
}