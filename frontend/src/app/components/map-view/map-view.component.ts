import { Component, AfterViewInit } from '@angular/core';
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

  constructor(
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    await this.loadProperties();
    await this.initMap();
  }

  private async loadProperties(): Promise<void> {
    this.loading = true;
    try {
      this.properties = await this.blockchainService.getAvailableProperties();
    } catch (error) {
      console.error('Erreur:', error);
      this.error = 'Impossible de charger les propriétés';
    } finally {
      this.loading = false;
    }
  }

  private async initMap(): Promise<void> {
    if (this.properties.length === 0) return;

    try {
      // Configuration des icônes
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Création de la carte
      this.map = L.map('map').setView([46.2276, 2.2137], 5);

      // Ajout de la carte
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      // Ajout des marqueurs
      this.addPropertyMarkers();

    } catch (error) {
      console.error('Erreur carte:', error);
      this.error = 'Erreur lors du chargement de la carte';
    }
  }

  private addPropertyMarkers(): void {
    this.properties.forEach(property => {
      const coords = this.getCoordinates(property.location);
      
      if (coords) {
        const marker = L.marker(coords)
          .addTo(this.map)
          .bindPopup(`
            <div style="min-width: 200px; padding: 10px;">
              <h4 style="margin: 0 0 10px 0;">${property.title}</h4>
              <p style="margin: 5px 0; color: green; font-weight: bold;">
                ${property.pricePerDay} ETH/jour
              </p>
              <p style="margin: 5px 0; color: #666;">
                📍 ${property.location}
              </p>
              <button onclick="window.location.href='/property/${property.id}'" 
                      style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                Voir détails
              </button>
            </div>
          `);
      }
    });
  }

  private getCoordinates(location: string): [number, number] | null {
    const locations: { [key: string]: [number, number] } = {
      'paris': [48.8566, 2.3522],
      'lyon': [45.7640, 4.8357],
      'marseille': [43.2965, 5.3698],
      'toulouse': [43.6047, 1.4442],
      'nice': [43.7102, 7.2620],
      'nantes': [47.2184, -1.5536],
      'strasbourg': [48.5734, 7.7521],
      'montpellier': [43.6108, 3.8767],
      'bordeaux': [44.8378, -0.5792],
      'lille': [50.6292, 3.0573]
    };

    const lowerLocation = location.toLowerCase();
    
    for (const [key, coords] of Object.entries(locations)) {
      if (lowerLocation.includes(key)) {
        return coords;
      }
    }

    // Coordonnées aléatoires en France
    return [
      46.0 + Math.random() * 6.0 - 3.0,
      -1.0 + Math.random() * 8.0 - 4.0
    ];
  }

  switchToListView(): void {
    this.router.navigate(['/properties']);
  }
}