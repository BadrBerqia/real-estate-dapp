import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PropertyListComponent } from './components/property-list/property-list.component';
import { PropertyDetailComponent } from './components/property-detail/property-detail.component';
import { MyPropertiesComponent } from './components/my-properties/my-properties.component';
import { MyRentalsComponent } from './components/my-rentals/my-rentals.component';
import { ListPropertyComponent } from './components/list-property/list-property.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/properties', pathMatch: 'full' },
  { path: 'properties', component: PropertyListComponent },
  { path: 'properties/map', component: MapViewComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
  { path: 'my-properties', component: MyPropertiesComponent },
  { path: 'my-rentals', component: MyRentalsComponent },
  { path: 'list-property', component: ListPropertyComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '/properties' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }