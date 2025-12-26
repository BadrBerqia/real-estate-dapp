import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Web3Service } from '../../services/web3.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.css']
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  loading = false;
  isConnected = false;
  processing = false;
  error = '';

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
    this.loadProperty();
    
    this.web3Service.account$.subscribe(account => {
      this.isConnected = !!account;
    });
  }
  
  

  async loadProperty() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      try {
        this.property = await this.blockchainService.getProperty(parseInt(id));
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = 'Erreur lors du chargement de la propriété';
      }
      this.loading = false;
    }
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

  // Vérification si le formulaire est valide
  canRent(): boolean {
    return !!this.rentalData.startDate && 
           !!this.rentalData.endDate && 
           this.rentalData.totalPrice > 0;
  }

  // Soumission du formulaire de location
  async onRentSubmit() {
    if (!this.property || !this.canRent()) return;

    this.processing = true;
    this.error = '';

    try {
      const startTimestamp = Math.floor(new Date(this.rentalData.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(this.rentalData.endDate).getTime() / 1000);
      const totalAmount = (this.rentalData.totalPrice + this.property.deposit).toString();

      console.log('🚀 Début de la location:', {
        propertyId: this.property.id,
        startDate: startTimestamp,
        endDate: endTimestamp,
        totalAmount: totalAmount
      });

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
        this.error = 'La propriété n\'est pas disponible';
      } else {
        this.error = 'Erreur lors de la location: ' + error.message;
      }
    } finally {
      this.processing = false;
    }
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
    this.router.navigate(['/properties']);
  }

  // Vérifie si la date de début est dans le futur
  getMinStartDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Vérifie si la date de fin est après la date de début
  getMinEndDate(): string {
    if (!this.rentalData.startDate) return this.getMinStartDate();
    const startDate = new Date(this.rentalData.startDate);
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }
};