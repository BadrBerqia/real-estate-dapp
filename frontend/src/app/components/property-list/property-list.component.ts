import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Web3Service } from '../../services/web3.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  error = '';
  isConnected = false;

  constructor(
    private blockchainService: BlockchainService,
    private web3Service: Web3Service,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadProperties();
    
    this.web3Service.account$.subscribe(account => {
      this.isConnected = !!account;
    });
  }

  async loadProperties() {
    this.loading = true;
    this.error = '';
    
    try {
      this.properties = await this.blockchainService.getAvailableProperties();
    } catch (error) {
      console.error('Erreur chargement propriétés:', error);
      this.error = 'Erreur lors du chargement des propriétés';
    } finally {
      this.loading = false;
    }
  }

  getPropertyImage(propertyId: number): string {
    const images = [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
    ];
    return images[propertyId % images.length];
  }

  viewProperty(propertyId: number) {
    this.router.navigate(['/property', propertyId]);
  }

  rentProperty(property: Property) {
    if (!this.isConnected) {
      alert('Veuillez connecter MetaMask pour louer une propriété');
      return;
    }
    this.viewProperty(property.id);
  }

  goToMap() {
    this.router.navigate(['/properties/map']);
  }

  goToListProperty() {
    if (!this.isConnected) {
      alert('Veuillez connecter MetaMask pour lister une propriété');
      return;
    }
    this.router.navigate(['/list-property']);
  }

  goToMyProperties() {
    this.router.navigate(['/my-properties']);
  }

  goToMyRentals() {
    this.router.navigate(['/my-rentals']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}