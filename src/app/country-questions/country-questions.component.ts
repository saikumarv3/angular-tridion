import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionsService } from '../services/questions.service';
import { TridionService, TridionContent } from '../services/tridion.service';

@Component({
  selector: 'country-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Individual Error Messages -->
    <div class="error-messages">
      <div class="error-card" *ngIf="ageError">
        {{ ageError }}
      </div>
      <div class="error-card" *ngFor="let error of getErrorMessages()">
        {{ error }}
      </div>
    </div>

    <div class="questions-card">
      <div class="card-header">
        <h3>{{ content?.questionsTitle }}</h3>
      </div>
      
      <div class="card-body">
        <div *ngFor="let question of commonQuestions" 
             class="question-item"
             [class.center-content]="isStateQuestion(question) || (isDobQuestion(question) && showDobQuestion())">
          <p>{{ question }}</p>
          
          <ng-container *ngIf="!isStateQuestion(question) && !isDobQuestion(question)">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" 
                       [name]="question"
                       [checked]="answers[question] === true"
                       (change)="setAnswer(question, true)">
                <span>{{ content?.buttonLabels?.yes }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" 
                       [name]="question"
                       [checked]="answers[question] === false"
                       (change)="setAnswer(question, false)">
                <span>{{ content?.buttonLabels?.no }}</span>
              </label>
            </div>
          </ng-container>

          <ng-container *ngIf="isStateQuestion(question)">
            <div class="state-select">
              <select 
                class="form-control"
                (change)="onStateChange($event)"
                [value]="selectedState">
                <option value="">Select your state</option>
                <option *ngFor="let state of content?.states" [value]="state">
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
                <option value="">{{ content?.dateLabels?.placeholder?.month }}</option>
                <option *ngFor="let month of months" [value]="month">
                  {{ month }}
                </option>
              </select>
              
              <select 
                class="form-control"
                (change)="onDobChange('day', $event)"
                [value]="selectedDob.day">
                <option value="">{{ content?.dateLabels?.placeholder?.day }}</option>
                <option *ngFor="let day of days" [value]="day">
                  {{ day }}
                </option>
              </select>
              
              <select 
                class="form-control"
                (change)="onDobChange('year', $event)"
                [value]="selectedDob.year">
                <option value="">{{ content?.dateLabels?.placeholder?.year }}</option>
                <option *ngFor="let year of years" [value]="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </ng-container>
        </div>

        <div *ngIf="countrySpecificQuestions.length > 0" class="country-specific-questions">
          <h4>{{ content?.countrySpecificQuestions?.title }}</h4>
          <div *ngFor="let question of countrySpecificQuestions" class="question-item">
            <p>{{ question }}</p>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" 
                       [name]="question"
                       [checked]="answers[question] === true"
                       (change)="setAnswer(question, true)">
                <span>{{ content?.buttonLabels?.yes }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" 
                       [name]="question"
                       [checked]="answers[question] === false"
                       (change)="setAnswer(question, false)">
                <span>{{ content?.buttonLabels?.no }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="next-button-container">
      <button class="btn" (click)="onNextClick()" [disabled]="!canProceed">
        {{ content?.buttonLabels?.next }}
      </button>
    </div>
  `,
  styleUrls: ['./country-questions.component.scss']
})
export class CountryQuestionsComponent implements OnInit, OnDestroy {
  content: TridionContent | null = null;
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
    private router: Router,
    private tridionService: TridionService
  ) {
    this.initializeData();
  }

  initializeData() {
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
    // Get Tridion content
    this.tridionService.getContent().subscribe(content => {
      this.content = content;
      if (content) {
        this.states = content.states;
        this.commonQuestions = [
          content.commonQuestions.questions.passport,
          content.commonQuestions.questions.travel,
          content.commonQuestions.questions.age,
          content.commonQuestions.questions.state
        ];
        // Only add DOB question if state is California
        if (this.selectedState === 'California') {
          this.commonQuestions.push(content.commonQuestions.questions.dob);
        }
      }
    });

    // Subscribe to selected country
    this.questionsService.getSelectedCountry().subscribe(country => {
      this.selectedCountry = country;
      if (this.content) {
        this.countrySpecificQuestions = this.content.countrySpecificQuestions.questions[country] || [];
      }
    });
  }

  ngOnDestroy() {
    // Do not reset when navigating to verification
    // Only reset if not going to verification
    if (this.router.url !== '/verification') {
      this.questionsService.resetAll();
    }
  }

  updateQuestions() {
    if (this.content) {
      this.commonQuestions = [
        this.content.commonQuestions.questions.passport,
        this.content.commonQuestions.questions.travel,
        this.content.commonQuestions.questions.age,
        this.content.commonQuestions.questions.state
      ];
      // Only add DOB question if state is California
      if (this.selectedState === 'California') {
        this.commonQuestions.push(this.content.commonQuestions.questions.dob);
      }
    }
  }

  setAnswer(question: string, answer: boolean) {
    this.answers[question] = answer;
    this.questionsService.setAnswer(question, answer);
  }

  onStateChange(event: Event) {
    const state = (event.target as HTMLSelectElement).value;
    this.selectedState = state;
    this.questionsService.setSelectedState(state);
    if (this.content) {
      this.answers[this.content.commonQuestions.questions.state] = state;
    }
    this.updateQuestions();
  }

  onDobChange(field: 'month' | 'day' | 'year', event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDob[field] = value;
    this.questionsService.setSelectedDob(this.selectedDob);
    if (this.content) {
      this.answers[this.content.commonQuestions.questions.dob] = this.selectedDob;
    }
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
    return this.content?.commonQuestions.questions.state === question;
  }

  isDobQuestion(question: string): boolean {
    return this.content?.commonQuestions.questions.dob === question;
  }

  showDobQuestion(): boolean {
    return this.selectedState === 'California';
  }
} 