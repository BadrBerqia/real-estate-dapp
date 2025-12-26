import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: any;
  private accountSubject = new BehaviorSubject<string>('');
  public account$: Observable<string> = this.accountSubject.asObservable();

  constructor() {
    this.initializeWeb3();
  }

  private initializeWeb3() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      import('web3').then(Web3 => {
        this.web3 = new Web3.default(window.ethereum);
        console.log('✅ Web3 initialisé avec MetaMask');
        
        // Écouter les changements de compte
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            this.accountSubject.next(accounts[0]);
          } else {
            this.accountSubject.next('');
          }
        });

      }).catch(error => {
        console.log('🌐 Mode navigation sans MetaMask');
      });
    } else {
      console.warn('MetaMask non détecté');
    }
  }

  async connectAccount(): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 non initialisé. Vérifiez MetaMask.');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const account = accounts[0];
      this.accountSubject.next(account);
      return account;
    } catch (error) {
      console.error('Erreur de connexion à MetaMask:', error);
      throw error;
    }
  }

  getWeb3(): any {
    if (!this.web3) {
      throw new Error('Web3 non initialisé.');
    }
    return this.web3;
  }

  async getBalance(address: string): Promise<string> {
    const web3 = this.getWeb3();
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
  }

  async checkNetwork(): Promise<boolean> {
    if (!this.web3) return false;
    
    try {
      const chainId = await this.web3.eth.getChainId();
      // Correction pour ES2020 - utiliser Number au lieu de BigInt
      return Number(chainId) === 11155111; // Sepolia
    } catch (error) {
      console.error('Erreur vérification réseau:', error);
      return false;
    }
  }

  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addSepoliaNetwork();
      }
    }
  }

  private async addSepoliaNetwork(): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0xaa36a7',
          chainName: 'Sepolia',
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        },
      ],
    });
  }
}