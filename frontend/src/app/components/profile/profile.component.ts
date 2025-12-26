import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  account: string = '';
  balance: string = '0';

  constructor(private web3Service: Web3Service) {}

  async ngOnInit() {
    this.web3Service.account$.subscribe(async (account: string) => {
      this.account = account;
      if (account) {
        this.balance = await this.web3Service.getBalance(account);
      }
    });
  }
}