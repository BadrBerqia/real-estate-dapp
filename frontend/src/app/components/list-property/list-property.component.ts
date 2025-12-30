import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';
import { AiService, PriceRequest } from '../../services/ai.service';

@Component({
  selector: 'app-list-property',
  templateUrl: './list-property.component.html',
  styleUrls: ['./list-property.component.css']
})
export class ListPropertyComponent {
  propertyData = {
    title: '',
    description: '',
    location: '',
    pricePerDay: 0,
    deposit: 0
  };

  // Données pour l'IA
  aiData = {
    surface: 50,
    rooms: 2,
    location_score: 7,
    distance_center: 5,
    season_index: 1.0
  };

  suggestedPrice: number | null = null;
  loadingPrediction = false;
  processing = false;

  constructor(
    private blockchainService: BlockchainService,
    private aiService: AiService,
    private router: Router
  ) {}

  predictPrice() {
    this.loadingPrediction = true;
    this.suggestedPrice = null;

    const request: PriceRequest = {
      surface: this.aiData.surface,
      rooms: this.aiData.rooms,
      location_score: this.aiData.location_score,
      distance_center: this.aiData.distance_center,
      season_index: this.aiData.season_index
    };

    this.aiService.predictPrice(request).subscribe({
      next: (response) => {
        this.suggestedPrice = response.suggested_price;
        this.loadingPrediction = false;
      },
      error: (error) => {
        console.error('Error predicting price:', error);
        this.loadingPrediction = false;
      }
    });
  }

  applySuggestedPrice() {
    if (this.suggestedPrice) {
      // Convertir EUR/mois en ETH/jour (1 ETH ≈ 3400 EUR)
      const pricePerDay = this.suggestedPrice / 30;
      const ethPrice = pricePerDay / 3400;
      this.propertyData.pricePerDay = parseFloat(ethPrice.toFixed(4));
    }
  }

  async onSubmit() {
    this.processing = true;
    try {
      await this.blockchainService.listProperty(
        this.propertyData.title,
        this.propertyData.description,
        this.propertyData.location,
        this.propertyData.pricePerDay,
        this.propertyData.deposit
      );
      this.router.navigate(['/my-properties']);
    } catch (error) {
      console.error('Error listing property:', error);
    } finally {
      this.processing = false;
    }
  }

  goBack() {
    this.router.navigate(['/properties']);
  }
}