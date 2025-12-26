import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { Property, RentalAgreement } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private contract: any;
  private contractAddress = '0xc4e673a90a09df397E53B7141bF612836e218dFF';

  private contractABI = [
    {
      "inputs": [
        {"internalType": "string","name": "_title","type": "string"},
        {"internalType": "string","name": "_description","type": "string"},
        {"internalType": "string","name": "_location","type": "string"},
        {"internalType": "uint256","name": "_pricePerDay","type": "uint256"},
        {"internalType": "uint256","name": "_deposit","type": "uint256"}
      ],
      "name": "listProperty",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAvailableProperties",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256","name": "id","type": "uint256"},
            {"internalType": "address","name": "owner","type": "address"},
            {"internalType": "string","name": "title","type": "string"},
            {"internalType": "string","name": "description","type": "string"},
            {"internalType": "string","name": "location","type": "string"},
            {"internalType": "uint256","name": "pricePerDay","type": "uint256"},
            {"internalType": "uint256","name": "deposit","type": "uint256"},
            {"internalType": "bool","name": "isAvailable","type": "bool"},
            {"internalType": "uint256[]","name": "rentalIds","type": "uint256[]"}
          ],
          "internalType": "struct IRealEstateRental.Property[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_propertyId","type": "uint256"}],
      "name": "getProperty",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256","name": "id","type": "uint256"},
            {"internalType": "address","name": "owner","type": "address"},
            {"internalType": "string","name": "title","type": "string"},
            {"internalType": "string","name": "description","type": "string"},
            {"internalType": "string","name": "location","type": "string"},
            {"internalType": "uint256","name": "pricePerDay","type": "uint256"},
            {"internalType": "uint256","name": "deposit","type": "uint256"},
            {"internalType": "bool","name": "isAvailable","type": "bool"},
            {"internalType": "uint256[]","name": "rentalIds","type": "uint256[]"}
          ],
          "internalType": "struct IRealEstateRental.Property",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "getUserProperties",
      "outputs": [{"internalType": "uint256[]","name": "","type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256","name": "_propertyId","type": "uint256"},
        {"internalType": "uint256","name": "_startDate","type": "uint256"},
        {"internalType": "uint256","name": "_endDate","type": "uint256"}
      ],
      "name": "rentProperty",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_rentalId","type": "uint256"}],
      "name": "completeRental",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_rentalId","type": "uint256"}],
      "name": "getRentalAgreement",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256","name": "id","type": "uint256"},
            {"internalType": "uint256","name": "propertyId","type": "uint256"},
            {"internalType": "address","name": "tenant","type": "address"},
            {"internalType": "uint256","name": "startDate","type": "uint256"},
            {"internalType": "uint256","name": "endDate","type": "uint256"},
            {"internalType": "uint256","name": "totalPrice","type": "uint256"},
            {"internalType": "uint256","name": "deposit","type": "uint256"},
            {"internalType": "bool","name": "isActive","type": "bool"},
            {"internalType": "bool","name": "isCompleted","type": "bool"},
            {"internalType": "bool","name": "depositReturned","type": "bool"}
          ],
          "internalType": "struct IRealEstateRental.RentalAgreement",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "getUserRentals",
      "outputs": [{"internalType": "uint256[]","name": "","type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  constructor(private web3Service: Web3Service) {
    this.initializeContract();
  }

  private initializeContract() {
    try {
      const web3 = this.web3Service.getWeb3();
      this.contract = new web3.eth.Contract(this.contractABI, this.contractAddress);
      console.log('✅ Contrat initialisé avec l\'adresse:', this.contractAddress);
    } catch (error) {
      console.warn('Contrat non initialisé - MetaMask requis');
    }
  }

  private getContract() {
    if (!this.contract) {
      this.initializeContract();
    }
    return this.contract;
  }

  // NOUVELLE MÉTHODE : Estimation automatique du gaz
  private async estimateGasWithFallback(transaction: any, from: string, value?: string): Promise<number> {
    try {
      console.log('⛽ Estimation du gaz...');
      
      // Estimation automatique
      const estimatedGas = await transaction.estimateGas({ from, value });
      console.log('✅ Gaz estimé:', estimatedGas);
      
      // Ajouter une marge de sécurité (20%)
      const gasWithMargin = Math.floor(estimatedGas * 1.2);
      console.log('🛡️ Gaz avec marge de sécurité:', gasWithMargin);
      
      return gasWithMargin;
      
    } catch (error) {
      console.warn('⚠️ Erreur estimation gaz, utilisation de valeurs par défaut:', error);
      
      // Fallback selon le type de transaction
      if (value) {
        // Transaction payable (location) - plus de gaz nécessaire
        return 800000;
      } else {
        // Transaction simple
        return 300000;
      }
    }
  }

  async listProperty(
    title: string,
    description: string,
    location: string,
    pricePerDay: number,
    deposit: number
  ): Promise<any> {
    try {
      console.log('🚀 DEBUT listProperty');
      
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      
      if (!contract) {
        throw new Error('Contrat non initialisé');
      }

      const web3 = this.web3Service.getWeb3();
      const pricePerDayWei = this.safeToWei(pricePerDay, web3);
      const depositWei = this.safeToWei(deposit, web3);

      if (!title || !location) {
        throw new Error('Titre et localisation requis');
      }

      if (pricePerDay <= 0) {
        throw new Error('Le prix par jour doit être supérieur à 0');
      }

      console.log('📋 Paramètres de la transaction:', {
        title,
        description,
        location,
        pricePerDay: pricePerDayWei,
        deposit: depositWei,
        from: account
      });

      const transaction = contract.methods
        .listProperty(title, description, location, pricePerDayWei, depositWei);

      // Estimation automatique du gaz
      const gas = await this.estimateGasWithFallback(transaction, account);
      
      const transactionObject = {
        from: account,
        gas: gas
      };

      console.log('⚙️ Configuration transaction:', transactionObject);

      const result = await transaction.send(transactionObject);
      
      console.log('✅ Transaction réussie:', result);
      return result;

    } catch (error: any) {
      console.error('❌ ERREUR listProperty:', error);
      
      if (error.code === 4001) {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else if (error.message?.includes('underflow')) {
        throw new Error('Erreur de conversion numérique. Utilisez des valeurs comme 0.01, 0.1, 1 ETH.');
      } else if (error.message?.includes('execution reverted')) {
        throw new Error('Le contrat a rejeté la transaction: ' + error.message);
      } else if (error.message?.includes('gas')) {
        throw new Error('Erreur de gaz: ' + error.message);
      } else {
        throw new Error('Erreur inconnue: ' + (error.message || 'Vérifiez la console pour plus de détails'));
      }
    }
  }

  // Conversion sécurisée en wei
  private safeToWei(value: number, web3: any): string {
    try {
      if (isNaN(value) || value < 0) {
        throw new Error('Valeur invalide: ' + value);
      }

      const valueString = value.toFixed(18);
      const weiValue = web3.utils.toWei(valueString, 'ether');
      
      if (!weiValue || weiValue === '0') {
        throw new Error('Conversion a produit une valeur nulle');
      }

      return weiValue;
      
    } catch (web3Error) {
      console.warn('⚠️ Erreur conversion Web3, fallback manuel:', web3Error);
      
      try {
        const manualWei = (value * 1e18).toFixed(0);
        if (manualWei === '0' && value > 0) {
          throw new Error('Valeur trop petite pour la conversion manuelle');
        }
        return manualWei;
      } catch (manualError) {
        throw new Error(`Impossible de convertir ${value} ETH en wei: ${manualError.message}`);
      }
    }
  }

  async getAvailableProperties(): Promise<Property[]> {
    try {
      const contract = this.getContract();
      const properties = await contract.methods.getAvailableProperties().call();
      
      return properties.map((prop: any) => ({
        id: Number(prop.id),
        owner: prop.owner,
        title: prop.title,
        description: prop.description,
        location: prop.location,
        pricePerDay: this.weiToEth(prop.pricePerDay),
        deposit: this.weiToEth(prop.deposit),
        isAvailable: prop.isAvailable,
        rentalIds: prop.rentalIds.map((id: string) => Number(id))
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  async getProperty(propertyId: number): Promise<Property> {
    try {
      const contract = this.getContract();
      const prop = await contract.methods.getProperty(propertyId).call();
      
      return {
        id: Number(prop.id),
        owner: prop.owner,
        title: prop.title,
        description: prop.description,
        location: prop.location,
        pricePerDay: this.weiToEth(prop.pricePerDay),
        deposit: this.weiToEth(prop.deposit),
        isAvailable: prop.isAvailable,
        rentalIds: prop.rentalIds.map((id: string) => Number(id))
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Impossible de récupérer la propriété: ' + error.message);
    }
  }

  async getUserProperties(): Promise<number[]> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      return contract.methods.getUserProperties(account).call();
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  }

  async rentProperty(
    propertyId: number,
    startDate: number,
    endDate: number,
    totalAmount: string
  ): Promise<any> {
    try {
      console.log('🚀 DEBUT rentProperty');
      
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      
      // Récupérer les détails de la propriété pour vérification
      const property = await this.getProperty(propertyId);
      
      // Calculer le nombre de jours
      const days = Math.ceil((endDate - startDate) / (24 * 60 * 60));
      
      // Vérifier que le montant correspond exactement
      const expectedAmount = (property.pricePerDay * days) + property.deposit;
      const sentAmount = parseFloat(totalAmount);
      
      console.log('💰 Vérification des montants:', {
        days: days,
        pricePerDay: property.pricePerDay,
        deposit: property.deposit,
        expectedAmount: expectedAmount,
        sentAmount: sentAmount,
        match: Math.abs(expectedAmount - sentAmount) < 0.000001
      });

      if (Math.abs(expectedAmount - sentAmount) > 0.000001) {
        throw new Error(`Montant incorrect. Attendu: ${expectedAmount.toFixed(6)} ETH, Reçu: ${sentAmount} ETH`);
      }

      // Convertir en wei
      const weiAmount = this.safeToWei(sentAmount, this.web3Service.getWeb3());
      
      console.log('📋 Paramètres location:', {
        propertyId: propertyId,
        startDate: startDate,
        endDate: endDate,
        days: days,
        amountETH: sentAmount,
        amountWei: weiAmount,
        from: account
      });

      // Vérifications supplémentaires
      if (!property.isAvailable) {
        throw new Error('La propriété n\'est pas disponible');
      }

      const now = Math.floor(Date.now() / 1000);
      if (startDate < now) {
        throw new Error('La date de début doit être dans le futur');
      }
      if (endDate <= startDate) {
        throw new Error('La date de fin doit être après la date de début');
      }

      if (days < 1) {
        throw new Error('La durée de location doit être d\'au moins 1 jour');
      }

      console.log('📤 Envoi de la transaction...');
      
      const transaction = contract.methods
        .rentProperty(propertyId, startDate, endDate);

      // ESTIMATION AUTOMATIQUE DU GAZ avec la valeur
      const gas = await this.estimateGasWithFallback(transaction, account, weiAmount);
      
      const result = await transaction.send({ 
        from: account, 
        value: weiAmount,
        gas: gas
      });
    
      console.log('✅ Location réussie:', result);
      return result;

    } catch (error: any) {
      console.error('❌ ERREUR rentProperty:', error);
      
      // Gestion détaillée des erreurs
      if (error.code === 4001) {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Fonds insuffisants pour compléter la transaction');
      } else if (error.message?.includes('execution reverted')) {
        if (error.message.includes('Property not available')) {
          throw new Error('La propriété n\'est pas disponible');
        } else if (error.message.includes('Invalid dates')) {
          throw new Error('Les dates de location sont invalides');
        } else if (error.message.includes('Incorrect amount')) {
          throw new Error('Le montant envoyé est incorrect');
        } else {
          throw new Error('Le contrat a rejeté la transaction: ' + error.message);
        }
      } else if (error.message?.includes('gas')) {
        throw new Error('Erreur de gaz. La limite de gaz est trop faible.');
      } else if (error.message?.includes('reverted by the EVM')) {
        throw new Error('Transaction rejetée par le réseau Ethereum. Vérifiez que la propriété est disponible et que les paramètres sont corrects.');
      } else {
        throw new Error('Erreur lors de la location: ' + (error.message || 'Erreur inconnue'));
      }
    }
  }

  async completeRental(rentalId: number): Promise<any> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      
      const transaction = contract.methods.completeRental(rentalId);
      const gas = await this.estimateGasWithFallback(transaction, account);
      
      return transaction.send({ 
        from: account,
        gas: gas
      });
    } catch (error: any) {
      console.error('Error completing rental:', error);
      throw new Error('Erreur lors de la complétion: ' + error.message);
    }
  }

  async getRentalAgreement(rentalId: number): Promise<RentalAgreement> {
    try {
      const contract = this.getContract();
      const rental = await contract.methods.getRentalAgreement(rentalId).call();
      
      return {
        id: Number(rental.id),
        propertyId: Number(rental.propertyId),
        tenant: rental.tenant,
        startDate: Number(rental.startDate),
        endDate: Number(rental.endDate),
        totalPrice: this.weiToEth(rental.totalPrice),
        deposit: this.weiToEth(rental.deposit),
        isActive: rental.isActive,
        isCompleted: rental.isCompleted,
        depositReturned: rental.depositReturned
      };
    } catch (error: any) {
      console.error('Error fetching rental agreement:', error);
      throw new Error('Erreur lors de la récupération de la location: ' + error.message);
    }
  }

  async getUserRentals(): Promise<number[]> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      return contract.methods.getUserRentals(account).call();
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      return [];
    }
  }

  // Méthode utilitaire pour convertir wei en ETH
  private weiToEth(weiValue: string): number {
    try {
      const web3 = this.web3Service.getWeb3();
      const ethValue = web3.utils.fromWei(weiValue, 'ether');
      return parseFloat(parseFloat(ethValue).toFixed(6));
    } catch (error) {
      console.error('Error converting wei to ETH:', error);
      return 0;
    }
  }
}