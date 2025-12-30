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
  filteredProperties: Property[] = [];
  loading = true;
  isConnected = false;

  // Filtres
  searchTerm = '';
  filterLocation = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;

  // Images pour les propriétés
  private propertyImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
  ];

  constructor(
    private blockchainService: BlockchainService,
    private web3Service: Web3Service,
    private router: Router
  ) {}

  async ngOnInit() {
    this.web3Service.account$.subscribe(account => {
      this.isConnected = !!account;
    });

    await this.loadProperties();
  }

  async loadProperties() {
    this.loading = true;
    try {
      this.properties = await this.blockchainService.getAvailableProperties();
      this.filteredProperties = this.properties;
    } catch (error) {
      console.error('Erreur:', error);
    }
    this.loading = false;
  }

  // ========== FILTRES ==========

  applyFilters() {
    this.filteredProperties = this.properties.filter(property => {
      // Filtre par recherche (titre ou description)
      const matchesSearch = !this.searchTerm || 
        property.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre par localisation
      const matchesLocation = !this.filterLocation || 
        property.location.toLowerCase().includes(this.filterLocation.toLowerCase());
      
      // Filtre par prix min
      const matchesMinPrice = !this.filterMinPrice || 
        property.pricePerDay >= this.filterMinPrice;
      
      // Filtre par prix max
      const matchesMaxPrice = !this.filterMaxPrice || 
        property.pricePerDay <= this.filterMaxPrice;
      
      return matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterLocation = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.filteredProperties = this.properties;
  }

  // ========== NAVIGATION ==========

  viewProperty(propertyId: number) {
    this.router.navigate(['/property', propertyId]);
  }

  rentProperty(property: Property) {
    this.router.navigate(['/property', property.id]);
  }

  goToListProperty() {
    this.router.navigate(['/list-property']);
  }

  goToMap() {
    this.router.navigate(['/map']);
  }

  // ========== HELPERS ==========

  getPropertyImage(propertyId: number): string {
    return this.propertyImages[propertyId % this.propertyImages.length];
  }
}