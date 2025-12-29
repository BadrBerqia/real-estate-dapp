import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { Property, RentalAgreement } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private contract: any;
  private contractAddress = '0x017E502864B84d1b6d821d914Fc9B591b1880A6a';

  private contractABI = [
    // listProperty
    {
      "inputs": [
        {"internalType": "string", "name": "_title", "type": "string"},
        {"internalType": "string", "name": "_description", "type": "string"},
        {"internalType": "string", "name": "_location", "type": "string"},
        {"internalType": "uint256", "name": "_pricePerDay", "type": "uint256"},
        {"internalType": "uint256", "name": "_deposit", "type": "uint256"}
      ],
      "name": "listProperty",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // getAvailableProperties
    {
      "inputs": [],
      "name": "getAvailableProperties",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "string", "name": "title", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "string", "name": "location", "type": "string"},
            {"internalType": "uint256", "name": "pricePerDay", "type": "uint256"},
            {"internalType": "uint256", "name": "deposit", "type": "uint256"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256[]", "name": "rentalIds", "type": "uint256[]"}
          ],
          "internalType": "struct RealEstateRental.Property[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // getProperty
    {
      "inputs": [{"internalType": "uint256", "name": "_propertyId", "type": "uint256"}],
      "name": "getProperty",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "string", "name": "title", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "string", "name": "location", "type": "string"},
            {"internalType": "uint256", "name": "pricePerDay", "type": "uint256"},
            {"internalType": "uint256", "name": "deposit", "type": "uint256"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256[]", "name": "rentalIds", "type": "uint256[]"}
          ],
          "internalType": "struct RealEstateRental.Property",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // getUserProperties
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserProperties",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    // rentProperty
    {
      "inputs": [
        {"internalType": "uint256", "name": "_propertyId", "type": "uint256"},
        {"internalType": "uint256", "name": "_startDate", "type": "uint256"},
        {"internalType": "uint256", "name": "_endDate", "type": "uint256"}
      ],
      "name": "rentProperty",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "payable",
      "type": "function"
    },
    // completeRental
    {
      "inputs": [{"internalType": "uint256", "name": "_rentalId", "type": "uint256"}],
      "name": "completeRental",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // cancelRental - NOUVELLE FONCTION
    {
      "inputs": [{"internalType": "uint256", "name": "_rentalId", "type": "uint256"}],
      "name": "cancelRental",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // getRentalAgreement
    {
      "inputs": [{"internalType": "uint256", "name": "_rentalId", "type": "uint256"}],
      "name": "getRentalAgreement",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "uint256", "name": "propertyId", "type": "uint256"},
            {"internalType": "address", "name": "tenant", "type": "address"},
            {"internalType": "uint256", "name": "startDate", "type": "uint256"},
            {"internalType": "uint256", "name": "endDate", "type": "uint256"},
            {"internalType": "uint256", "name": "totalPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "deposit", "type": "uint256"},
            {"internalType": "enum RealEstateRental.RentalStatus", "name": "status", "type": "uint8"}
          ],
          "internalType": "struct RealEstateRental.RentalAgreement",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // getUserRentals
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserRentals",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    // hasDateConflict
    {
      "inputs": [
        {"internalType": "uint256", "name": "_propertyId", "type": "uint256"},
        {"internalType": "uint256", "name": "_startDate", "type": "uint256"},
        {"internalType": "uint256", "name": "_endDate", "type": "uint256"}
      ],
      "name": "hasDateConflict",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    // isAvailableForDates
    {
      "inputs": [
        {"internalType": "uint256", "name": "_propertyId", "type": "uint256"},
        {"internalType": "uint256", "name": "_startDate", "type": "uint256"},
        {"internalType": "uint256", "name": "_endDate", "type": "uint256"}
      ],
      "name": "isAvailableForDates",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    // getBookedDates
    {
      "inputs": [{"internalType": "uint256", "name": "_propertyId", "type": "uint256"}],
      "name": "getBookedDates",
      "outputs": [
        {"internalType": "uint256[]", "name": "startDates", "type": "uint256[]"},
        {"internalType": "uint256[]", "name": "endDates", "type": "uint256[]"}
      ],
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
      console.log('✅ Contract initialized:', this.contractAddress);
    } catch (error) {
      console.warn('Contract not initialized - MetaMask required');
    }
  }

  private getContract() {
    if (!this.contract) {
      this.initializeContract();
    }
    return this.contract;
  }

  private async estimateGasWithFallback(transaction: any, from: string, value?: string): Promise<number> {
    try {
      const estimatedGas = await transaction.estimateGas({ from, value });
      return Math.floor(estimatedGas * 1.2);
    } catch (error) {
      console.warn('Gas estimation failed, using fallback:', error);
      return value ? 500000 : 300000;
    }
  }

  private safeToWei(value: number, web3: any): string {
    try {
      const valueString = value.toFixed(18);
      return web3.utils.toWei(valueString, 'ether');
    } catch (error) {
      return (value * 1e18).toFixed(0);
    }
  }

  private weiToEth(weiValue: string): number {
    try {
      const web3 = this.web3Service.getWeb3();
      const ethValue = web3.utils.fromWei(weiValue, 'ether');
      return parseFloat(parseFloat(ethValue).toFixed(6));
    } catch (error) {
      return 0;
    }
  }

  // ============ Property Methods ============

  async listProperty(
    title: string,
    description: string,
    location: string,
    pricePerDay: number,
    deposit: number
  ): Promise<any> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      const web3 = this.web3Service.getWeb3();

      const pricePerDayWei = this.safeToWei(pricePerDay, web3);
      const depositWei = this.safeToWei(deposit, web3);

      const transaction = contract.methods.listProperty(
        title, description, location, pricePerDayWei, depositWei
      );

      const gas = await this.estimateGasWithFallback(transaction, account);

      return await transaction.send({ from: account, gas });
    } catch (error: any) {
      console.error('Error listing property:', error);
      throw new Error(this.parseError(error));
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
        isAvailable: prop.isActive,
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
        isAvailable: prop.isActive,
        rentalIds: prop.rentalIds.map((id: string) => Number(id))
      };
    } catch (error: any) {
      console.error('Error fetching property:', error);
      throw new Error('Unable to fetch property');
    }
  }

  async getUserProperties(): Promise<number[]> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      const ids = await contract.methods.getUserProperties(account).call();
      return ids.map((id: string) => Number(id));
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  }

  // ============ Rental Methods ============

  async rentProperty(
    propertyId: number,
    startDate: number,
    endDate: number,
    totalAmount: string
  ): Promise<any> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      const web3 = this.web3Service.getWeb3();

      // Check availability
      const isAvailable = await contract.methods.isAvailableForDates(propertyId, startDate, endDate).call();
      if (!isAvailable) {
        throw new Error('Property is not available for these dates');
      }

      const weiAmount = this.safeToWei(parseFloat(totalAmount), web3);
      const transaction = contract.methods.rentProperty(propertyId, startDate, endDate);
      const gas = await this.estimateGasWithFallback(transaction, account, weiAmount);

      return await transaction.send({ from: account, value: weiAmount, gas });
    } catch (error: any) {
      console.error('Error renting property:', error);
      throw new Error(this.parseError(error));
    }
  }

  async completeRental(rentalId: number): Promise<any> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();

      const transaction = contract.methods.completeRental(rentalId);
      const gas = await this.estimateGasWithFallback(transaction, account);

      return await transaction.send({ from: account, gas });
    } catch (error: any) {
      console.error('Error completing rental:', error);
      throw new Error(this.parseError(error));
    }
  }

  async cancelRental(rentalId: number): Promise<any> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();

      const transaction = contract.methods.cancelRental(rentalId);
      const gas = await this.estimateGasWithFallback(transaction, account);

      return await transaction.send({ from: account, gas });
    } catch (error: any) {
      console.error('Error cancelling rental:', error);
      throw new Error(this.parseError(error));
    }
  }

  async getRentalAgreement(rentalId: number): Promise<RentalAgreement> {
    try {
      const contract = this.getContract();
      const rental = await contract.methods.getRentalAgreement(rentalId).call();

      const statusMap = ['Active', 'Completed', 'Cancelled'];

      return {
        id: Number(rental.id),
        propertyId: Number(rental.propertyId),
        tenant: rental.tenant,
        startDate: Number(rental.startDate),
        endDate: Number(rental.endDate),
        totalPrice: this.weiToEth(rental.totalPrice),
        deposit: this.weiToEth(rental.deposit),
        isActive: Number(rental.status) === 0,
        isCompleted: Number(rental.status) === 1,
        depositReturned: Number(rental.status) === 1
      };
    } catch (error: any) {
      console.error('Error fetching rental:', error);
      throw new Error('Unable to fetch rental');
    }
  }

  async getUserRentals(): Promise<number[]> {
    try {
      const account = await this.web3Service.connectAccount();
      const contract = this.getContract();
      const ids = await contract.methods.getUserRentals(account).call();
      return ids.map((id: string) => Number(id));
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      return [];
    }
  }

  async getBookedDates(propertyId: number): Promise<{startDates: number[], endDates: number[]}> {
    try {
      const contract = this.getContract();
      const result = await contract.methods.getBookedDates(propertyId).call();
      return {
        startDates: result.startDates.map((d: string) => Number(d)),
        endDates: result.endDates.map((d: string) => Number(d))
      };
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      return { startDates: [], endDates: [] };
    }
  }

  async isAvailableForDates(propertyId: number, startDate: number, endDate: number): Promise<boolean> {
    try {
      const contract = this.getContract();
      return await contract.methods.isAvailableForDates(propertyId, startDate, endDate).call();
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  private parseError(error: any): string {
    if (error.code === 4001) return 'Transaction cancelled by user';
    if (error.message?.includes('insufficient funds')) return 'Insufficient funds';
    if (error.message?.includes('execution reverted')) {
      const match = error.message.match(/reason="([^"]+)"/);
      return match ? match[1] : 'Transaction rejected by contract';
    }
    return error.message || 'Unknown error';
  }
}