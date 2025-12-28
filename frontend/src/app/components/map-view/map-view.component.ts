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
    await this.initMap();
    await this.loadProperties();
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

      // Création de la carte (centré sur le Maroc)
      this.map = L.map('map').setView([31.7917, -7.0926], 6);

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
    this.properties.forEach(property => {
      const coords = this.getCoordinates(property.location);

      if (coords) {
        L.marker(coords)
          .addTo(this.map)
          .bindPopup(`
            <div style="min-width: 200px; padding: 10px;">
              <h4 style="margin: 0 0 10px 0;">${property.title}</h4>
              <p style="margin: 5px 0; color: #10b981; font-weight: bold;">
                ${property.pricePerDay} ETH/jour
              </p>
              <p style="margin: 5px 0; color: #666;">
                📍 ${property.location}
              </p>
              <button onclick="window.location.href='/property/${property.id}'"
                      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600;">
                Voir détails
              </button>
            </div>
          `);
      }
    });

    // Ajuster la vue pour montrer tous les marqueurs
    if (this.properties.length > 0) {
      const bounds = this.properties
        .map(p => this.getCoordinates(p.location))
        .filter(c => c !== null);
      
      if (bounds.length > 0) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
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

    // Coordonnées aléatoires au Maroc par défaut
    return [
      31.0 + Math.random() * 4.0,
      -8.0 + Math.random() * 4.0
    ];
  }

  switchToListView(): void {
    this.router.navigate(['/properties']);
  }
}