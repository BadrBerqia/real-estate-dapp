import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  account: string = '';
  balance: string = '0';
  
  user: User = {
    walletAddress: '',
    username: '',
    email: '',
    phone: '',
    role: 'RENTER'
  };
  
  loading = false;
  saving = false;
  message = '';
  messageType = '';

  constructor(
    private web3Service: Web3Service,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.web3Service.account$.subscribe(async (account: string) => {
      this.account = account;
      if (account) {
        this.balance = await this.web3Service.getBalance(account);
        this.user.walletAddress = account;
        this.loadUserProfile(account);
      }
    });
  }

  loadUserProfile(walletAddress: string) {
    this.loading = true;
    this.userService.getUser(walletAddress).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        // User not found, register new user
        if (error.status === 404) {
          this.registerNewUser();
        } else {
          this.loading = false;
          this.showMessage('Erreur lors du chargement du profil', 'error');
        }
      }
    });
  }

  registerNewUser() {
    this.userService.registerUser(this.user).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showMessage('Erreur lors de la création du profil', 'error');
      }
    });
  }

  saveProfile() {
    this.saving = true;
    this.userService.updateUser(this.account, this.user).subscribe({
      next: (user) => {
        this.user = user;
        this.saving = false;
        this.showMessage('Profil sauvegardé avec succès !', 'success');
      },
      error: () => {
        this.saving = false;
        this.showMessage('Erreur lors de la sauvegarde', 'error');
      }
    });
  }

  showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}