import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '../services/questions.service';
import { CountryQuestionsComponent } from '../country-questions/country-questions.component';

@Component({
  selector: 'home',
  standalone: true,
  imports: [CommonModule, FormsModule, CountryQuestionsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  selectedCountry: string = '';
  countries: string[] = ['USA', 'UK', 'Canada', 'Australia'];

  constructor(private questionsService: QuestionsService) {
    console.log('HomeComponent initialized');
  }

  onCountryChange() {
    console.log('Country changed to:', this.selectedCountry);
    this.questionsService.setSelectedCountry(this.selectedCountry);
  }
} 