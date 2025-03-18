import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TermsComponent } from './terms/terms.component';
import { CountryQuestionsComponent } from './country-questions/country-questions.component';
import { PlacesToVisitComponent } from './places-to-visit/places-to-visit.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'verification', component: CountryQuestionsComponent, data: { isVerification: true } },
  { path: 'places-to-visit', component: PlacesToVisitComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: 'home' }
];
