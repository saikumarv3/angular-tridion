import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TermsComponent } from './terms/terms.component';
import { VerificationComponent } from './verification/verification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: 'home' }
];
