import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare let L: any;

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  walletConnected = false;
  walletAddress = '';
  
  properties: Property[] = [
    {
      id: 1,
      title: 'Modern Apartment in Casablanca',
      location: 'Maarif, Casablanca',
      price: 0.5,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      lat: 33.5731,
      lng: -7.5898
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool',
      location: 'Anfa, Casablanca',
      price: 1.2,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      lat: 33.5950,
      lng: -7.6356
    },
    {
      id: 3,
      title: 'Cozy Studio Downtown',
      location: 'Centre Ville, Casablanca',
      price: 0.3,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      lat: 33.5892,
      lng: -7.6114
    },
    {
      id: 4,
      title: 'Beachfront Condo',
      location: 'Ain Diab, Casablanca',
      price: 0.8,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      lat: 33.5833,
      lng: -7.6700
    }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    const map = L.map('map').setView([33.5731, -7.6098], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    this.properties.forEach(property => {
      const marker = L.marker([property.lat, property.lng]).addTo(map);
      marker.bindPopup(`
        <strong>${property.title}</strong><br>
        ${property.location}<br>
        <span style="color: #10b981; font-weight: bold;">${property.price} ETH/month</span>
      `);
    });
  }

  async connectWallet() {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        this.walletAddress = accounts[0];
        this.walletConnected = true;
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask to use this dApp!');
    }
  }

  truncateAddress(address: string): string {
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
}