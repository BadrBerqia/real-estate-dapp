import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container">
      <header class="header">
        <div class="logo">🏠 RealEstate<span class="highlight">dApp</span></div>
        <button class="wallet-btn" (click)="connectWallet()">
          {{ walletConnected ? '✅ ' + walletAddress.slice(0,6) + '...' : '🦊 Connect Wallet' }}
        </button>
      </header>

      <section class="hero">
        <h1>Decentralized Real Estate Rentals</h1>
        <p>Rent properties directly on Ethereum. No intermediaries, no hidden fees.</p>
      </section>

      <section class="properties">
        <h2>🏘️ Available Properties</h2>
        <div class="grid">
          <div class="card">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" alt="Apartment">
            <h3>Modern Apartment</h3>
            <p>📍 Maarif, Casablanca</p>
            <span class="price">0.5 ETH/month</span>
          </div>
          <div class="card">
            <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400" alt="Villa">
            <h3>Luxury Villa</h3>
            <p>📍 Anfa, Casablanca</p>
            <span class="price">1.2 ETH/month</span>
          </div>
          <div class="card">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" alt="Studio">
            <h3>Cozy Studio</h3>
            <p>📍 Centre Ville</p>
            <span class="price">0.3 ETH/month</span>
          </div>
          <div class="card">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400" alt="Condo">
            <h3>Beachfront Condo</h3>
            <p>📍 Ain Diab</p>
            <span class="price">0.8 ETH/month</span>
          </div>
        </div>
      </section>

      <footer>Built with ❤️ on Ethereum | Spring Boot • Angular • Kubernetes</footer>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 1.5rem; font-weight: 700; }
    .highlight { color: #10b981; }
    .wallet-btn { background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; }
    .hero { text-align: center; padding: 60px 0; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 20px; }
    .hero p { color: #94a3b8; font-size: 1.2rem; }
    .properties { margin: 40px 0; }
    .properties h2 { margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; }
    .card { background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .card img { width: 100%; height: 180px; object-fit: cover; }
    .card h3, .card p { padding: 0 16px; }
    .card h3 { margin-top: 16px; }
    .card p { color: #94a3b8; margin: 8px 16px; }
    .price { display: block; padding: 16px; color: #10b981; font-weight: 700; font-size: 1.2rem; }
    footer { text-align: center; padding: 40px 0; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 40px; }
  `]
})
export class AppComponent {
  walletConnected = false;
  walletAddress = '';

  connectWallet() {
    if (typeof (window as any).ethereum !== 'undefined') {
      (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts: string[]) => {
          this.walletAddress = accounts[0];
          this.walletConnected = true;
        })
        .catch(() => console.error('User denied access'));
    } else {
      alert('Please install MetaMask!');
    }
  }
}