import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionsService } from '../services/questions.service';
import { TridionService, TridionContent } from '../services/tridion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-places-to-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="places-page" *ngIf="content && countryPlaces">
      <div class="header">
        <h1>{{ content.placesToVisit.title }}</h1>
        <p class="intro-message">{{ content.placesToVisit.message }}</p>
        <div class="selected-country">
          Selected Country: <strong>{{ selectedCountry }}</strong>
        </div>
      </div>

      <div class="places-container">
        <div *ngFor="let place of countryPlaces; let placeIndex = index" class="place-card">
          <div class="place-header">
            <h3>{{ place.name }}</h3>
            <span class="must-visit-badge" *ngIf="place.mustVisit">Must Visit!</span>
          </div>
          
          <p class="place-description">{{ place.description }}</p>
          
          <div class="best-time">
            <strong>Best Time to Visit:</strong> {{ place.bestTimeToVisit }}
          </div>

          <div class="question-item">
            <p>Would you like to visit this destination?</p>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" 
                       [name]="'place_' + placeIndex"
                       [checked]="answers[place.name] === true"
                       (change)="setAnswer(place.name, true)">
                <span>{{ content.buttonLabels.yes }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" 
                       [name]="'place_' + placeIndex"
                       [checked]="answers[place.name] === false"
                       (change)="setAnswer(place.name, false)">
                <span>{{ content.buttonLabels.no }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <div class="button-container">
        <button class="btn-back" (click)="onBack()">
          {{ content.buttonLabels.back }}
        </button>
        <button 
          class="btn-next" 
          (click)="onNextClick()"
          [disabled]="!isAllAnswered()">
          {{ content.buttonLabels.next }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .places-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 24px;
      }
    }

    .intro-message {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin: 15px 0;
    }

    .selected-country {
      display: inline-block;
      padding: 10px 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      font-size: 18px;
      margin: 15px 0;

      strong {
        color: #0056b3;
      }
    }

    .places-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .place-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .place-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        color: #2c3e50;
        margin: 0;
      }
    }

    .must-visit-badge {
      background-color: #e74c3c;
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }

    .place-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .best-time {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #666;
    }

    .question-item {
      margin-top: 20px;
      padding: 15px;
      border-top: 1px solid #dee2e6;

      p {
        margin-bottom: 15px;
        color: #34495e;
      }
    }

    .radio-group {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 4px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      transition: all 0.2s;

      &:hover {
        background-color: #e9ecef;
      }

      input[type="radio"] {
        margin: 0;
      }
    }

    .error-message {
      color: #e74c3c;
      text-align: center;
      margin: 20px 0;
      padding: 10px;
      background-color: #fde8e8;
      border-radius: 4px;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding: 20px 0;

      button {
        padding: 12px 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .btn-back {
      background-color: #6c757d;
      color: white;

      &:hover {
        background-color: #5a6268;
      }
    }

    .btn-next {
      background-color: #0056b3;
      color: white;

      &:hover:not(:disabled) {
        background-color: #004494;
      }
    }
  `]
})
export class PlacesToVisitComponent implements OnInit, OnDestroy {
  content: TridionContent | null = null;
  selectedCountry: string = '';
  countryPlaces: Array<{
    name: string;
    description: string;
    mustVisit: boolean;
    bestTimeToVisit: string;
  }> | null = null;
  answers: { [key: string]: boolean } = {};
  errorMessage: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private questionsService: QuestionsService,
    private router: Router,
    private tridionService: TridionService
  ) {}

  ngOnInit() {
    this.content = this.tridionService.getCachedContent();
    
    // Get the selected country from the service
    this.subscriptions.push(
      this.questionsService.getSelectedCountry().subscribe(country => {
        this.selectedCountry = country;
        if (this.content && country) {
          this.countryPlaces = this.content.placesToVisit.places[country] || null;
          if (!this.countryPlaces) {
            this.router.navigate(['/home']);
          }
        } else {
          // If no country is selected, redirect back to home
          this.router.navigate(['/home']);
        }
      })
    );

    // Load any existing place answers
    this.subscriptions.push(
      this.questionsService.getPlaceAnswers().subscribe(answers => {
        if (Object.keys(answers).length > 0) {
          this.answers = answers;
        }
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setAnswer(placeName: string, answer: boolean) {
    this.answers[placeName] = answer;
    this.errorMessage = '';
  }

  isAllAnswered(): boolean {
    if (!this.countryPlaces) return false;
    return this.countryPlaces.every(place => typeof this.answers[place.name] === 'boolean');
  }

  onBack() {
    // Go back to verification page
    this.router.navigate(['/verification'], { replaceUrl: true });
  }

  onNextClick() {
    if (this.validateAnswers()) {
      // Store place visit preferences in the service
      this.questionsService.setPlaceAnswers(this.answers);
      
      // Log place visit preferences
      console.log('Places to Visit Preferences:', {
        country: this.selectedCountry,
        answers: this.answers
      });

      // Navigate to terms page
      this.router.navigate(['/terms'], { replaceUrl: true });
    }
  }

  validateAnswers(): boolean {
    if (this.isAllAnswered()) {
      // Store the answers in the service
      this.questionsService.setPlaceAnswers(this.answers);
      return true;
    } else {
      this.errorMessage = this.content?.placesToVisit.errorMessages.required || 
                         'Please answer all questions before proceeding.';
      return false;
    }
  }
} 