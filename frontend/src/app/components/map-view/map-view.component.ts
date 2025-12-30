import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Property } from '../../models/property.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  properties: Property[] = [];
  loading = true;

  // Coordonnées des villes marocaines et françaises
  private cityCoordinates: { [key: string]: [number, number] } = {
    // Maroc
    'casablanca': [33.5731, -7.5898],
    'rabat': [34.0209, -6.8416],
    'marrakech': [31.6295, -7.9811],
    'fes': [34.0331, -5.0003],
    'fès': [34.0331, -5.0003],
    'tanger': [35.7595, -5.8340],
    'tangier': [35.7595, -5.8340],
    'agadir': [30.4278, -9.5981],
    'meknes': [33.8731, -5.5407],
    'meknès': [33.8731, -5.5407],
    'oujda': [34.6867, -1.9114],
    'kenitra': [34.2610, -6.5802],
    'tetouan': [35.5889, -5.3626],
    'tétouan': [35.5889, -5.3626],
    'safi': [32.2994, -9.2372],
    'mohammedia': [33.6866, -7.3830],
    'el jadida': [33.2316, -8.5007],
    'beni mellal': [32.3373, -6.3498],
    'nador': [35.1681, -2.9330],
    'taza': [34.2300, -3.9900],
    'settat': [33.0014, -7.6200],
    'essaouira': [31.5085, -9.7595],
    'chefchaouen': [35.1688, -5.2636],
    'ouarzazate': [30.9189, -6.8936],
    'ifrane': [33.5228, -5.1109],
    
    // France
    'paris': [48.8566, 2.3522],
    'marseille': [43.2965, 5.3698],
    'lyon': [45.7640, 4.8357],
    'toulouse': [43.6047, 1.4442],
    'nice': [43.7102, 7.2620],
    'nantes': [47.2184, -1.5536],
    'strasbourg': [48.5734, 7.7521],
    'montpellier': [43.6108, 3.8767],
    'bordeaux': [44.8378, -0.5792],
    'lille': [50.6292, 3.0573],
    'rennes': [48.1173, -1.6778],
    'reims': [49.2583, 4.0317],
    'le havre': [49.4944, 0.1079],
    'grenoble': [45.1885, 5.7245],
    'dijon': [47.3220, 5.0415],
    'angers': [47.4784, -0.5632],
    'cannes': [43.5528, 7.0174]
  };

  // Images pour les propriétés
  private propertyImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop'
  ];

  // Track used coordinates to avoid overlap
  private usedCoordinates: Map<string, number> = new Map();

  constructor(
    private blockchainService: BlockchainService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    await this.loadProperties();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  private initMap() {
    // Centrer sur le Maroc par défaut
    this.map = L.map('map', {
      center: [31.7917, -7.0926],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Ajouter les marqueurs
    this.addPropertyMarkers();
  }

  async loadProperties() {
    this.loading = true;
    try {
      this.properties = await this.blockchainService.getAvailableProperties();
    } catch (error) {
      console.error('Error loading properties:', error);
    }
    this.loading = false;
  }

  private getCoordinatesForLocation(location: string, propertyId: number): [number, number] {
    const locationLower = location.toLowerCase().trim();
    
    // Chercher une correspondance dans les villes connues
    for (const [city, coords] of Object.entries(this.cityCoordinates)) {
      if (locationLower.includes(city)) {
        // Ajouter un décalage pour éviter la superposition
        const key = city;
        const count = this.usedCoordinates.get(key) || 0;
        this.usedCoordinates.set(key, count + 1);
        
        // Décalage en spirale pour mieux répartir les marqueurs
        const angle = count * 0.8;
        const radius = 0.002 + (count * 0.001);
        const offsetLat = Math.cos(angle) * radius;
        const offsetLng = Math.sin(angle) * radius;
        
        return [coords[0] + offsetLat, coords[1] + offsetLng];
      }
    }
    
    // Si pas de correspondance, générer des coordonnées au Maroc
    const baseLat = 32 + (propertyId * 0.5) % 4;
    const baseLng = -7 + (propertyId * 0.3) % 3;
    return [baseLat, baseLng];
  }

  private createPriceIcon(price: number): L.DivIcon {
    return L.divIcon({
      className: 'price-marker',
      html: `<div class="price-tag">${price} ETH</div>`,
      iconSize: [80, 36],
      iconAnchor: [40, 36]
    });
  }

  private addPropertyMarkers() {
    if (!this.map) return;

    // Reset used coordinates
    this.usedCoordinates.clear();

    this.properties.forEach((property) => {
      const coords = this.getCoordinatesForLocation(property.location, property.id);
      
      // Créer un marqueur avec le prix
      const priceIcon = this.createPriceIcon(property.pricePerDay);
      
      const marker = L.marker(coords, { icon: priceIcon }).addTo(this.map);

      // Image de la propriété
      const imageUrl = this.propertyImages[property.id % this.propertyImages.length];

      // Popup avec les détails
      const popupContent = `
        <div class="map-popup">
          <img src="${imageUrl}" alt="${property.title}" class="popup-image">
          <div class="popup-content">
            <h3 class="popup-title">${property.title}</h3>
            <p class="popup-location">📍 ${property.location}</p>
            <div class="popup-price">
              <span class="price-value">${property.pricePerDay} ETH</span>
              <span class="price-unit">/jour</span>
            </div>
            <p class="popup-deposit">Dépôt: ${property.deposit} ETH</p>
            <button class="popup-btn" onclick="window.navigateToProperty(${property.id})">
              Voir les détails →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-popup'
      });

      // Effet hover sur le marqueur
      marker.on('mouseover', function() {
        this.openPopup();
      });
    });

    // Fonction globale pour la navigation
    (window as any).navigateToProperty = (propertyId: number) => {
      this.ngZone.run(() => {
        this.router.navigate(['/property', propertyId]);
      });
    };

    // Ajuster la vue pour montrer tous les marqueurs
    if (this.properties.length > 0) {
      const bounds = L.latLngBounds(
        this.properties.map(p => this.getCoordinatesForLocation(p.location, p.id))
      );
      
      // Reset pour recalculer
      this.usedCoordinates.clear();
      
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  goBack() {
    this.router.navigate(['/properties']);
  }
}