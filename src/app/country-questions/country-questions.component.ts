import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

    <!-- Verification Mode -->
    <div class="questions-card" *ngIf="isVerification && content">
      <div class="card-header">
        <h3>{{ content.verificationPage.title }}</h3>
        <p class="intro-message">{{ content.verificationPage.message }}</p>
        <div class="selected-country">
          Selected Country: <strong>{{ selectedCountry }}</strong>
        </div>
      </div>
      
      <div class="card-body">
        <div *ngFor="let question of verificationQuestions; let i = index" 
             class="question-item">
          <p>{{ i + 1 }}. {{ question }}</p>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" 
                     [name]="'verification_' + i"
                     [checked]="verificationAnswers[question] === true"
                     (change)="setVerificationAnswer(question, true)">
              <span>{{ content.buttonLabels.yes }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" 
                     [name]="'verification_' + i"
                     [checked]="verificationAnswers[question] === false"
                     (change)="setVerificationAnswer(question, false)">
              <span>{{ content.buttonLabels.no }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular Questions Mode -->
    <div class="questions-card" *ngIf="!isVerification && content">
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

    <div class="button-container">
      <button *ngIf="isVerification" 
              class="btn-back" 
              (click)="onBack()">
        {{ content?.buttonLabels?.back }}
      </button>
      <button class="btn-next" 
              (click)="onNextClick()" 
              [disabled]="!canProceed">
        {{ content?.buttonLabels?.next }}
      </button>
    </div>
  `,
  styles: [`
    .questions-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;

      h3 {
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

    .question-item {
      margin-bottom: 25px;
      padding: 15px;
      border-bottom: 1px solid #dee2e6;

      &:last-child {
        border-bottom: none;
      }

      p {
        font-size: 16px;
        color: #2c3e50;
        margin-bottom: 15px;
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

    .error-messages {
      margin-bottom: 20px;

      .error-card {
        background-color: #fde8e8;
        color: #e74c3c;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 10px;
      }
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding: 0 20px;

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
export class CountryQuestionsComponent implements OnInit, OnDestroy {
  content: TridionContent | null = null;
  commonQuestions: string[] = [];
  countrySpecificQuestions: string[] = [];
  verificationQuestions: string[] = [];
  verificationAnswers: { [key: string]: boolean } = {};
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
  isVerification: boolean = false;

  constructor(
    private questionsService: QuestionsService,
    private router: Router,
    private route: ActivatedRoute,
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
    // Check if we're in verification mode
    this.route.data.subscribe(data => {
      this.isVerification = data['isVerification'] || false;
    });

    // Use cached content
    this.content = this.tridionService.getCachedContent();
    
    // Subscribe to selected country
    this.questionsService.getSelectedCountry().subscribe(country => {
      this.selectedCountry = country;
      if (!country && this.isVerification) {
        // If no country is selected in verification mode, go back to home
        this.router.navigate(['/home']);
        return;
      }

      if (this.content) {
        if (this.isVerification) {
          // Get verification questions for the selected country
          this.verificationQuestions = this.content.verificationPage.questions[country] || [];
        } else {
          // Regular mode - get country specific questions
          this.countrySpecificQuestions = this.content.countrySpecificQuestions.questions[country] || [];
          // Initialize common questions
          this.initializeCommonQuestions();
        }
      }
    });

    if (!this.isVerification) {
      // Only subscribe to these in regular mode
      this.questionsService.getSelectedState().subscribe(state => {
        this.selectedState = state;
        this.updateQuestions();
      });

      this.questionsService.getSelectedDob().subscribe(dob => {
        this.selectedDob = dob;
      });
    }
  }

  initializeCommonQuestions() {
    if (this.content) {
      this.commonQuestions = [
        this.content.commonQuestions.questions.passport,
        this.content.commonQuestions.questions.travel
      ];

      // Add water question if USA is selected and travel answer is yes
      if (this.selectedCountry === 'USA' && this.answers[this.content.commonQuestions.questions.travel] === true) {
        this.commonQuestions.push(this.content.commonQuestions.questions.water);
      }

      // Add remaining questions
      this.commonQuestions.push(
        this.content.commonQuestions.questions.age,
        this.content.commonQuestions.questions.state
      );

      if (this.selectedState === 'California') {
        this.commonQuestions.push(this.content.commonQuestions.questions.dob);
      }
    }
  }

  setVerificationAnswer(question: string, answer: boolean) {
    this.verificationAnswers[question] = answer;
    this.validateVerificationAnswers();
  }

  validateVerificationAnswers() {
    const allAnswered = this.verificationQuestions.every(
      question => typeof this.verificationAnswers[question] === 'boolean'
    );

    if (!allAnswered) {
      this.questionErrors['verification'] = this.content?.verificationPage.errorMessages.required || 
                                         'Please answer all verification questions to proceed.';
      this.canProceed = false;
    } else {
      delete this.questionErrors['verification'];
      this.canProceed = true;
    }
  }

  onBack() {
    if (this.isVerification) {
      // If coming from places-to-visit, go back there
      if (this.router.url.includes('verification')) {
        this.router.navigate(['/places-to-visit'], { replaceUrl: true });
      } else {
        // Otherwise, preserve the country when going back to home
        const currentCountry = this.selectedCountry;
        this.router.navigate(['/home']).then(() => {
          this.questionsService.setSelectedCountry(currentCountry);
        });
      }
    } else {
      // Regular mode - go back to home
      this.router.navigate(['/home']);
    }
  }

  onNextClick() {
    if (this.isVerification) {
      if (this.isValidVerification()) {
        // Store verification answers in the service
        Object.entries(this.verificationAnswers).forEach(([question, answer]) => {
          this.answers[question] = answer;
        });
        // Store answers in the service
        if (this.questionsService.validateOnNext(this.answers)) {
          // Log verification answers
          console.log('Verification Answers:', {
            country: this.selectedCountry,
            answers: this.verificationAnswers
          });
          // Navigate to places to visit
          this.router.navigate(['/places-to-visit'], { replaceUrl: true });
        }
      } else {
        this.questionErrors['verification'] = this.content?.verificationPage.errorMessages.required || 
                                           'Please answer all verification questions to proceed.';
      }
    } else {
      const isValid = this.questionsService.validateOnNext(this.answers);
      if (isValid) {
        // Store all answers in the service
        this.questionsService.setAllAnswers({
          country: this.selectedCountry,
          state: this.selectedState,
          answers: this.answers,
          dateOfBirth: this.selectedDob
        });
        
        // Log regular questions answers
        console.log('Regular Questions Answers:', {
          country: this.selectedCountry,
          state: this.selectedState,
          answers: this.answers,
          dateOfBirth: this.selectedDob
        });
        
        // Navigate to places to visit
        this.router.navigate(['/places-to-visit'], { replaceUrl: true });
      }
    }
  }

  isValidVerification(): boolean {
    return this.verificationQuestions.every(
      question => typeof this.verificationAnswers[question] === 'boolean'
    );
  }

  updateQuestions() {
    if (this.content) {
      this.commonQuestions = [
        this.content.commonQuestions.questions.passport,
        this.content.commonQuestions.questions.travel
      ];

      // Add water question if USA is selected and travel answer is yes
      if (this.selectedCountry === 'USA' && this.answers[this.content.commonQuestions.questions.travel] === true) {
        this.commonQuestions.push(this.content.commonQuestions.questions.water);
      }

      // Add remaining questions
      this.commonQuestions.push(
        this.content.commonQuestions.questions.age,
        this.content.commonQuestions.questions.state
      );

      // Only add DOB question if state is California
      if (this.selectedState === 'California') {
        this.commonQuestions.push(this.content.commonQuestions.questions.dob);
      }
    }
  }

  setAnswer(question: string, answer: boolean) {
    this.answers[question] = answer;
    this.questionsService.setAnswer(question, answer);

    // If the travel question is answered and country is USA, update questions
    if (question === this.content?.commonQuestions.questions.travel && this.selectedCountry === 'USA') {
      this.updateQuestions();
    }
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

  ngOnDestroy() {
    // Do not reset when navigating to verification or places-to-visit
    if (!this.router.url.includes('/verification') && !this.router.url.includes('/places-to-visit')) {
      this.questionsService.resetAll();
    }
  }
} 