import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';

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

  processing = false;

  constructor(
    private blockchainService: BlockchainService,
    private router: Router
  ) {}

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