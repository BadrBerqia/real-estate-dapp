import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.css']
})
export class WalletConnectComponent implements OnInit {
  connectedAccount: string = '';
  balance: string = '0';
  connecting: boolean = false;
  isCorrectNetwork: boolean = false;

  constructor(private web3Service: Web3Service) {}

  ngOnInit() {
    this.web3Service.account$.subscribe(async (account: string) => {
      this.connectedAccount = account;
      if (account) {
        await this.loadBalance(account);
        await this.checkNetwork();
      }
    });
  }

  async connectWallet() {
    this.connecting = true;
    try {
      await this.web3Service.connectAccount();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur de connexion à MetaMask. Vérifiez que MetaMask est installé.');
    } finally {
      this.connecting = false;
    }
  }

  async loadBalance(account: string) {
    try {
      this.balance = await this.web3Service.getBalance(account);
    } catch (error) {
      console.error('Erreur de chargement du solde:', error);
    }
  }

  async checkNetwork() {
    try {
      this.isCorrectNetwork = await this.web3Service.checkNetwork();
    } catch (error) {
      console.error('Erreur vérification réseau:', error);
      this.isCorrectNetwork = false;
    }
  }

  async switchToSepolia() {
    try {
      await this.web3Service.switchToSepolia();
      setTimeout(() => this.checkNetwork(), 2000);
    } catch (error) {
      console.error('Erreur changement réseau:', error);
    }
  }
}