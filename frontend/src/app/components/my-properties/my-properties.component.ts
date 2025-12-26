import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-my-properties',
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.css']
})
export class MyPropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = true;
  
  // Propriétés pour la recherche et filtrage
  searchTerm: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  pageSize: number = 6;

  constructor(
    private blockchainService: BlockchainService,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.loadMyProperties();
  }

  async loadMyProperties() {
    try {
      const propertyIds = await this.blockchainService.getUserProperties();
      this.properties = [];
      
      for (const id of propertyIds) {
        const property = await this.blockchainService.getProperty(id);
        this.properties.push(property);
      }
      
      // Initialiser les propriétés filtrées
      this.updateFilteredProperties();
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      this.loading = false;
    }
  }

  // Méthodes de filtrage et recherche
  updateFilteredProperties() {
    this.filteredProperties = this.properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           property.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || 
                           (this.statusFilter === 'available' && property.isAvailable) ||
                           (this.statusFilter === 'occupied' && !property.isAvailable);
      
      return matchesSearch && matchesStatus;
    });
    
    // Réinitialiser la page à 1 après filtrage
    this.currentPage = 1;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.updateFilteredProperties();
  }

  onStatusFilter(event: any) {
    this.statusFilter = event.target.value;
    this.updateFilteredProperties();
  }

  // Méthodes de pagination
  get totalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.pageSize);
  }

  get paginatedProperties(): Property[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProperties.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Méthodes de statistiques
  getAvailablePropertiesCount(): number {
    return this.properties.filter(p => p.isAvailable).length;
  }

  getOccupiedPropertiesCount(): number {
    return this.properties.filter(p => !p.isAvailable).length;
  }

  // Méthodes utilitaires d'interface
  getStatusClass(property: Property): string {
    return property.isAvailable ? 'available' : 'occupied';
  }

  getStatusText(property: Property): string {
    return property.isAvailable ? 'Disponible' : 'Occupée';
  }

  truncateDescription(description: string): string {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  getPropertyImage(propertyId: number): string {
    const images = [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=250&fit=crop'
    ];
    return images[propertyId % images.length];
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=250&fit=crop';
  }

  // Méthodes de navigation et actions
  viewProperty(propertyId: number) {
    this.router.navigate(['/property', propertyId]);
  }

  editProperty(propertyId: number) {
    // Pour l'instant, rediriger vers la page de détails
    // Vous pouvez créer une page d'édition séparée plus tard
    this.router.navigate(['/property', propertyId]);
  }

  listNewProperty() {
    this.router.navigate(['/list-property']);
  }

  // Méthode pour calculer le revenu estimé (optionnel)
  getEstimatedRevenue(property: Property): number {
    // Estimation basée sur le prix par jour et le nombre de locations
    const rentalCount = property.rentalIds?.length || 0;
    const averageStayDays = 3; // Estimation de 3 jours par location
    return property.pricePerDay * averageStayDays * rentalCount;
  }

  // Méthode pour rafraîchir les données
  async refreshProperties() {
    this.loading = true;
    await this.loadMyProperties();
  }

  // Méthode pour formater les nombres (éviter les décimales trop longues)
  formatPrice(price: number): string {
    return price.toFixed(6).replace(/\.?0+$/, '');
  }

  // Gestion des erreurs de chargement
  get hasError(): boolean {
    return this.properties.length === 0 && !this.loading;
  }

  get showPagination(): boolean {
    return this.filteredProperties.length > this.pageSize;
  }
}