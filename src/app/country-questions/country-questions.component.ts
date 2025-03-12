import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionsService } from '../services/questions.service';

@Component({
  selector: 'country-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="questions-card">
      <div class="card-header">
        <h3>Travel Questions</h3>
      </div>
      
      <div class="card-body">
        <div *ngFor="let question of commonQuestions" class="question-item">
          <p>{{ question }}</p>
          
          <ng-container *ngIf="!isStateQuestion(question) && !isDobQuestion(question)">
            <div class="btn-group">
              <button 
                class="btn" 
                [class.active]="answers[question] === true"
                (click)="setAnswer(question, true)">
                Yes
              </button>
              <button 
                class="btn" 
                [class.active]="answers[question] === false"
                (click)="setAnswer(question, false)">
                No
              </button>
            </div>
          </ng-container>

          <ng-container *ngIf="isStateQuestion(question)">
            <div class="state-select">
              <select 
                class="form-control"
                (change)="onStateChange($event)"
                [value]="selectedState">
                <option value="">Select State</option>
                <option *ngFor="let state of states" [value]="state">
                  {{ state }}
                </option>
              </select>
            </div>
          </ng-container>

          <ng-container *ngIf="isDobQuestion(question) && showDobQuestion()">
            <div class="dob-select">
              <select 
                class="form-control"
                (change)="onDobChange('month', $event)"
                [value]="selectedDob.month">
                <option value="">Month</option>
                <option *ngFor="let month of months" [value]="month">
                  {{ month }}
                </option>
              </select>
              
              <select 
                class="form-control"
                (change)="onDobChange('day', $event)"
                [value]="selectedDob.day">
                <option value="">Day</option>
                <option *ngFor="let day of days" [value]="day">
                  {{ day }}
                </option>
              </select>
              
              <select 
                class="form-control"
                (change)="onDobChange('year', $event)"
                [value]="selectedDob.year">
                <option value="">Year</option>
                <option *ngFor="let year of years" [value]="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </ng-container>
        </div>

        <div *ngIf="countrySpecificQuestions.length > 0" class="country-specific-questions">
          <div *ngFor="let question of countrySpecificQuestions" class="question-item">
            <p>{{ question }}</p>
            <div class="btn-group">
              <button 
                class="btn" 
                [class.active]="answers[question] === true"
                (click)="setAnswer(question, true)">
                Yes
              </button>
              <button 
                class="btn" 
                [class.active]="answers[question] === false"
                (click)="setAnswer(question, false)">
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="getErrorMessages().length > 0" class="error-message">
      <div *ngFor="let error of getErrorMessages()">{{ error }}</div>
    </div>

    <div *ngIf="ageError" class="error-message">
      {{ ageError }}
    </div>

    <div class="next-button-container">
      <button class="btn" (click)="onNextClick()" [disabled]="!canProceed">
        Next
      </button>
    </div>
  `,
  styleUrls: ['./country-questions.component.scss']
})
export class CountryQuestionsComponent implements OnInit, OnDestroy {
  commonQuestions: string[] = [];
  countrySpecificQuestions: string[] = [];
  selectedCountry: string = '';
  selectedState: string = '';
  states: string[] = [];
  months: string[] = [];
  days: string[] = [];
  years: string[] = [];
  selectedDob: { day: string; month: string; year: string } = { day: '', month: '', year: '' };
  answers: { [key: string]: boolean | string | { day: string; month: string; year: string } } = {};
  ageError: string = '';
  questionErrors: { [key: string]: string } = {};
  canProceed: boolean = true;

  constructor(
    private questionsService: QuestionsService,
    private router: Router
  ) {
    this.initializeData();
  }

  initializeData() {
    this.states = this.questionsService.states;
    this.months = this.questionsService.months;
    this.days = this.questionsService.days;
    this.years = this.questionsService.years;
    this.answers = {};
    
    this.questionsService.getAgeError().subscribe(error => {
      this.ageError = error;
    });

    this.questionsService.getQuestionErrors().subscribe(errors => {
      this.questionErrors = errors;
    });

    this.questionsService.getCanProceed().subscribe(canProceed => {
      this.canProceed = canProceed;
    });

    this.questionsService.getSelectedState().subscribe(state => {
      this.selectedState = state;
      this.updateQuestions();
    });

    this.questionsService.getSelectedDob().subscribe(dob => {
      this.selectedDob = dob;
    });
  }

  ngOnInit() {
    // Subscribe to selected country
    this.questionsService.getSelectedCountry().subscribe(country => {
      this.selectedCountry = country;
      this.countrySpecificQuestions = this.questionsService.getCountrySpecificQuestions(country);
    });
    this.updateQuestions();
  }

  ngOnDestroy() {
    // Do not reset when navigating to verification
    // Only reset if not going to verification
    if (this.router.url !== '/verification') {
      this.questionsService.resetAll();
    }
  }

  updateQuestions() {
    this.commonQuestions = this.questionsService.getQuestions(this.selectedState);
  }

  setAnswer(question: string, answer: boolean | string) {
    this.answers[question] = answer;
    
    // Check age requirement immediately
    if (question === 'Are you over 18 years old?' && answer === false) {
      this.questionsService.validateAge(false);
    } else if (question === 'Are you over 18 years old?' && answer === true) {
      this.questionsService.validateAge(true);
    }

    // Clear error for this specific question
    this.questionsService.updateAnswer(question, answer);
  }

  onStateChange(event: Event) {
    const state = (event.target as HTMLSelectElement).value;
    this.selectedState = state;
    this.questionsService.setSelectedState(state);
    this.answers['Select your state of residence:'] = state;
    this.updateQuestions();
  }

  onDobChange(type: 'day' | 'month' | 'year', event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDob = { ...this.selectedDob, [type]: value };
    this.questionsService.setSelectedDob(this.selectedDob);
    this.answers['Enter your date of birth:'] = this.selectedDob;
  }

  onNextClick() {
    const isValid = this.questionsService.validateOnNext(this.answers);
    if (isValid) {
      // Store the current country before navigation
      const currentCountry = this.selectedCountry;
      this.router.navigate(['/verification']).then(() => {
        // Ensure the country is still set after navigation
        this.questionsService.setSelectedCountry(currentCountry);
      });
    }
  }

  // Helper method to get all error messages as an array
  getErrorMessages(): string[] {
    return Object.values(this.questionErrors);
  }

  isStateQuestion(question: string): boolean {
    return question === 'Select your state of residence:';
  }

  isDobQuestion(question: string): boolean {
    return question === this.questionsService.dobQuestion;
  }

  showDobQuestion(): boolean {
    return this.selectedState === 'California';
  }
} 