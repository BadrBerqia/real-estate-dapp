import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { Property } from '../../models/property.model';

declare let L: any;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements AfterViewInit {
  private map: any;
  properties: Property[] = [];
  loading = false;
  error = '';

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
    private router: Router,
    private ngZone: NgZone
  ) {
    // Exposer la méthode de navigation globalement pour les popups
    (window as any).navigateToProperty = (id: number) => {
      this.ngZone.run(() => {
        this.router.navigate(['/property', id]);
      });
    };
  }

  async ngAfterViewInit() {
    await this.initMap();
    await this.loadProperties();
  }

  private getPropertyImage(propertyId: number): string {
    return this.propertyImages[propertyId % this.propertyImages.length];
  }

  private async loadProperties(): Promise<void> {
    this.loading = true;
    try {
      this.properties = await this.blockchainService.getAvailableProperties();
      if (this.properties.length > 0) {
        this.addPropertyMarkers();
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.error = 'Impossible de charger les propriétés';
    } finally {
      this.loading = false;
    }
  }

  private async initMap(): Promise<void> {
    try {
      // Configuration des icônes
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Création de la carte (centré sur le Maroc/France)
      this.map = L.map('map').setView([40.0, 0.0], 4);

      // Ajout des tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

    } catch (error) {
      console.error('Erreur carte:', error);
      this.error = 'Erreur lors du chargement de la carte';
    }
  }

  private addPropertyMarkers(): void {
    const bounds: [number, number][] = [];

    this.properties.forEach(property => {
      const coords = this.getCoordinates(property.location);

      if (coords) {
        bounds.push(coords);
        const imageUrl = this.getPropertyImage(property.id);

        const popupContent = `
          <div style="min-width: 250px; font-family: 'Inter', sans-serif;">
            <img src="${imageUrl}" 
                 alt="${property.title}" 
                 style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -13px -13px 10px -13px; width: calc(100% + 26px);">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${property.title}
            </h4>
            <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">
              ${property.pricePerDay} ETH<span style="font-size: 12px; color: #6b7280; font-weight: 400;">/jour</span>
            </p>
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px;">
              📍 ${property.location}
            </p>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e5e7eb; margin-bottom: 12px;">
              <span style="font-size: 12px; color: #9ca3af;">Dépôt</span>
              <span style="font-size: 12px; font-weight: 600; color: #374151;">${property.deposit} ETH</span>
            </div>
            <button onclick="navigateToProperty(${property.id})"
                    style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      border: none;
                      padding: 10px 16px;
                      border-radius: 8px;
                      cursor: pointer;
                      width: 100%;
                      font-weight: 600;
                      font-size: 14px;
                      transition: transform 0.2s, box-shadow 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
              🔑 Voir les détails
            </button>
          </div>
        `;

        L.marker(coords)
          .addTo(this.map)
          .bindPopup(popupContent, {
            maxWidth: 280,
            className: 'custom-popup'
          });
      }
    });

    // Ajuster la vue pour montrer tous les marqueurs
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }

  private getCoordinates(location: string): [number, number] | null {
    const locations: { [key: string]: [number, number] } = {
      // Maroc
      'casablanca': [33.5731, -7.5898],
      'rabat': [34.0209, -6.8416],
      'marrakech': [31.6295, -7.9811],
      'fes': [34.0331, -5.0003],
      'tanger': [35.7595, -5.8340],
      'agadir': [30.4278, -9.5981],
      'meknes': [33.8935, -5.5547],
      'oujda': [34.6867, -1.9114],
      // France
      'paris': [48.8566, 2.3522],
      'lyon': [45.7640, 4.8357],
      'marseille': [43.2965, 5.3698],
      'toulouse': [43.6047, 1.4442],
      'nice': [43.7102, 7.2620],
      'nantes': [47.2184, -1.5536],
      'bordeaux': [44.8378, -0.5792],
      'lille': [50.6292, 3.0573]
    };

    const lowerLocation = location.toLowerCase();

    for (const [key, coords] of Object.entries(locations)) {
      if (lowerLocation.includes(key)) {
        return coords;
      }
    }

    // Coordonnées par défaut (centre Europe/Maroc)
    return [
      35.0 + Math.random() * 10.0,
      -5.0 + Math.random() * 10.0
    ];
  }

  switchToListView(): void {
    this.router.navigate(['/properties']);
  }
}