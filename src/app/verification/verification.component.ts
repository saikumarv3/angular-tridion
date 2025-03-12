import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TridionService } from '../services/tridion.service';
import { QuestionsService } from '../services/questions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Error Messages -->
    <div class="error-messages" *ngIf="error">
      <div class="error-card">
        {{ error }}
      </div>
    </div>

    <div class="verification-container">
      <h1>{{ content?.verificationPage?.title || 'Verification' }}</h1>
      <p class="intro-message">{{ content?.verificationPage?.message || 'Please answer these verification questions before proceeding.' }}</p>
      
      <div *ngIf="selectedCountry" class="selected-country">
        Selected Country: {{ selectedCountry }}
      </div>
      
      <div class="questions-container">
        <div *ngFor="let question of verificationQuestions; let i = index" class="question-item">
          <p class="question-text">{{ question }}</p>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" 
                     [name]="'verification_' + i"
                     [checked]="answers[question] === true"
                     (change)="setAnswer(question, true)">
              <span>{{ content?.buttonLabels?.yes || 'Yes' }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" 
                     [name]="'verification_' + i"
                     [checked]="answers[question] === false"
                     (change)="setAnswer(question, false)">
              <span>{{ content?.buttonLabels?.no || 'No' }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="button-container">
        <button 
          class="back-button" 
          (click)="onBack()">
          {{ content?.buttonLabels?.back || 'Back' }}
        </button>
        <button 
          class="next-button" 
          (click)="onNext()">
          {{ content?.buttonLabels?.next || 'Next' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .selected-country {
      text-align: center;
      margin-bottom: 20px;
      padding: 12px;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      font-weight: bold;
      color: #495057;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .intro-message {
      color: #666;
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 30px;
      text-align: center;
    }

    .questions-container {
      margin-bottom: 30px;
    }

    .question-item {
      margin-bottom: 25px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f8f9fa;
      border: 1px solid #e0e0e0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .question-text {
      color: #333;
      font-size: 1.1rem;
      margin: 0;
      flex: 1;
      text-align: left;
    }

    .radio-group {
      display: flex;
      gap: 2rem;
      justify-content: flex-end;
      min-width: 200px;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #e6f0ff;
      }

      input[type="radio"] {
        width: 18px;
        height: 18px;
        margin: 0;
        cursor: pointer;

        &:checked + span {
          color: #007bff;
          font-weight: 500;
        }
      }

      span {
        color: #495057;
        font-size: 1rem;
        transition: color 0.3s ease;
      }
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding: 0 20px;
    }

    .back-button {
      padding: 12px 30px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #5a6268;
      }
    }

    .next-button {
      padding: 12px 30px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #0056b3;
      }
    }
  `]
})
export class VerificationComponent implements OnInit, OnDestroy {
  content: any;
  selectedCountry: string = '';
  verificationQuestions: string[] = [];
  answers: { [key: string]: boolean } = {};
  error: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private tridionService: TridionService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit() {
    // Get the selected country first
    this.subscriptions.push(
      this.questionsService.getSelectedCountry().subscribe(country => {
        if (!country) {
          // If no country is selected, redirect back to home
          this.router.navigate(['/home']);
          return;
        }
        this.selectedCountry = country;
        
        // Use cached content
        this.content = this.tridionService.getCachedContent();
        this.loadQuestionsIfReady();
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadQuestionsIfReady() {
    if (this.content && this.selectedCountry) {
      this.verificationQuestions = this.content.verificationPage.questions[this.selectedCountry] || [];
    }
  }

  setAnswer(question: string, answer: boolean) {
    this.answers[question] = answer;
    this.error = '';
  }

  isValid(): boolean {
    return this.verificationQuestions.every(question => 
      typeof this.answers[question] === 'boolean'
    );
  }

  onNext() {
    if (this.isValid()) {
      // Reset all data except country when proceeding to terms
      this.questionsService.resetExceptCountry();
      this.router.navigate(['/terms']);
    } else {
      this.error = this.content?.verificationPage?.errorMessages?.required || 
                   'Please answer all verification questions to proceed.';
    }
  }

  onBack() {
    // Preserve the country when going back
    const currentCountry = this.selectedCountry;
    this.router.navigate(['/home']).then(() => {
      this.questionsService.setSelectedCountry(currentCountry);
    });
  }
} 