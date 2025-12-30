import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { WalletConnectComponent } from './components/wallet-connect/wallet-connect.component';
import { PropertyListComponent } from './components/property-list/property-list.component';
import { PropertyDetailComponent } from './components/property-detail/property-detail.component';
import { MyPropertiesComponent } from './components/my-properties/my-properties.component';
import { MyRentalsComponent } from './components/my-rentals/my-rentals.component';
import { ListPropertyComponent } from './components/list-property/list-property.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { ProfileComponent } from './components/profile/profile.component';

// Services
import { Web3Service } from './services/web3.service';
import { BlockchainService } from './services/blockchain.service';
import { AiService } from './services/ai.service';

@NgModule({
  declarations: [
    AppComponent,
    WalletConnectComponent,
    PropertyListComponent,
    PropertyDetailComponent,
    MyPropertiesComponent,
    MyRentalsComponent,
    ListPropertyComponent,
    MapViewComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [
    Web3Service,
    BlockchainService,
    AiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }