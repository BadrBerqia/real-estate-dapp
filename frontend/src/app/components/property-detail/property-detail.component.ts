import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Web3Service } from '../../services/web3.service';
import { Property, RentalAgreement } from '../../models/property.model';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.css']
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  loading = false;
  isConnected = false;
  isOwner = false;
  processing = false;
  error = '';
  currentAccount = '';
  
  // Mode édition
  editMode = false;
  editData = {
    title: '',
    description: '',
    location: '',
    pricePerDay: 0,
    deposit: 0
  };

  // Réservations de la propriété
  bookings: RentalAgreement[] = [];
  loadingBookings = false;

  // Données du formulaire de location
  rentalData = {
    startDate: '',
    endDate: '',
    totalPrice: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockchainService: BlockchainService,
    private web3Service: Web3Service
  ) {}

  async ngOnInit() {
    this.web3Service.account$.subscribe(async account => {
      this.isConnected = !!account;
      this.currentAccount = account || '';
      
      // Vérifier si c'est le propriétaire après chargement
      if (this.property && account) {
        this.isOwner = this.property.owner.toLowerCase() === account.toLowerCase();
        if (this.isOwner) {
          await this.loadBookings();
        }
      }
    });

    await this.loadProperty();
  }

  async loadProperty() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      try {
        this.property = await this.blockchainService.getProperty(parseInt(id));
        
        // Vérifier si c'est le propriétaire
        if (this.currentAccount && this.property) {
          this.isOwner = this.property.owner.toLowerCase() === this.currentAccount.toLowerCase();
          
          // Initialiser les données d'édition
          this.editData = {
            title: this.property.title,
            description: this.property.description,
            location: this.property.location,
            pricePerDay: this.property.pricePerDay,
            deposit: this.property.deposit
          };
          
          // Charger les réservations si propriétaire
          if (this.isOwner) {
            await this.loadBookings();
          }
        }
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = 'Erreur lors du chargement de la propriété';
      }
      this.loading = false;
    }
  }

  async loadBookings() {
    if (!this.property) return;
    
    this.loadingBookings = true;
    try {
      this.bookings = [];
      
      // Récupérer les IDs de location de la propriété
      for (const rentalId of this.property.rentalIds) {
        try {
          const rental = await this.blockchainService.getRentalAgreement(rentalId);
          this.bookings.push(rental);
        } catch (e) {
          console.warn('Could not load rental', rentalId);
        }
      }
      
      // Trier par date de début
      this.bookings.sort((a, b) => a.startDate - b.startDate);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    this.loadingBookings = false;
  }

  // Toggle mode édition
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode && this.property) {
      this.editData = {
        title: this.property.title,
        description: this.property.description,
        location: this.property.location,
        pricePerDay: this.property.pricePerDay,
        deposit: this.property.deposit
      };
    }
  }

  // Sauvegarder les modifications (Note: le contrat actuel ne supporte pas la modification)
  async saveChanges() {
    alert('⚠️ La modification des propriétés n\'est pas encore supportée par le smart contract actuel. Cette fonctionnalité sera disponible dans une prochaine version.');
    this.editMode = false;
  }

  // Calcul du prix total basé sur les dates
  calculateTotal() {
    if (this.rentalData.startDate && this.rentalData.endDate && this.property) {
      const start = new Date(this.rentalData.startDate);
      const end = new Date(this.rentalData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

      if (days > 0) {
        this.rentalData.totalPrice = days * this.property.pricePerDay;
      } else {
        this.rentalData.totalPrice = 0;
      }
    }
  }

  calculateDays(): number {
    if (this.rentalData.startDate && this.rentalData.endDate) {
      const start = new Date(this.rentalData.startDate);
      const end = new Date(this.rentalData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  }

  canRent(): boolean {
    return !!this.rentalData.startDate &&
           !!this.rentalData.endDate &&
           this.rentalData.totalPrice > 0 &&
           !this.isOwner;
  }

  async onRentSubmit() {
    if (!this.property || !this.canRent()) return;

    this.processing = true;
    this.error = '';

    try {
      const startTimestamp = Math.floor(new Date(this.rentalData.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(this.rentalData.endDate).getTime() / 1000);
      const totalAmount = (this.rentalData.totalPrice + this.property.deposit).toString();

      await this.blockchainService.rentProperty(
        this.property.id,
        startTimestamp,
        endTimestamp,
        totalAmount
      );

      alert('✅ Location confirmée !');
      this.router.navigate(['/my-rentals']);

    } catch (error: any) {
      console.error('Erreur location:', error);

      if (error.code === 4001) {
        this.error = 'Transaction annulée par l\'utilisateur';
      } else if (error.message?.includes('insufficient funds')) {
        this.error = 'Fonds insuffisants pour la location';
      } else if (error.message?.includes('execution reverted')) {
        this.error = 'La propriété n\'est pas disponible pour ces dates';
      } else {
        this.error = 'Erreur lors de la location: ' + error.message;
      }
    } finally {
      this.processing = false;
    }
  }

  // Helpers pour les réservations
  getBookingStatusClass(booking: RentalAgreement): string {
    if (booking.isCancelled) return 'cancelled';
    if (booking.isCompleted) return 'completed';
    if (booking.isActive) {
      const now = Date.now() / 1000;
      if (now >= booking.startDate && now <= booking.endDate) return 'ongoing';
      return 'upcoming';
    }
    return 'pending';
  }

  getBookingStatusText(booking: RentalAgreement): string {
    if (booking.isCancelled) return 'Annulée';
    if (booking.isCompleted) return 'Terminée';
    if (booking.isActive) {
      const now = Date.now() / 1000;
      if (now >= booking.startDate && now <= booking.endDate) return 'En cours';
      return 'À venir';
    }
    return 'En attente';
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR');
  }

  getPropertyImage(propertyId: number): string {
    const images = [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'
    ];
    return images[propertyId % images.length];
  }

  formatAddress(address: string): string {
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  goBack() {
    if (this.isOwner) {
      this.router.navigate(['/my-properties']);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  getMinStartDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getMinEndDate(): string {
    if (!this.rentalData.startDate) return this.getMinStartDate();
    const startDate = new Date(this.rentalData.startDate);
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }

  getActiveBookingsCount(): number {
  return this.bookings.filter(b => b.isActive).length;
}


getCompletedBookingsCount(): number {
  return this.bookings.filter(b => b.isCompleted).length;
}
}