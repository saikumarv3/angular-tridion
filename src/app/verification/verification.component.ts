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
          <div class="button-group">
            <button 
              [class.selected]="answers[question] === true"
              (click)="setAnswer(question, true)"
              class="answer-button">
              {{ content?.buttonLabels?.yes || 'Yes' }}
            </button>
            <button 
              [class.selected]="answers[question] === false"
              (click)="setAnswer(question, false)"
              class="answer-button">
              {{ content?.buttonLabels?.no || 'No' }}
            </button>
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
      background-color: white;
      border: 1px solid #e0e0e0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .question-text {
      color: #333;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .button-group {
      display: flex;
      gap: 10px;
    }

    .answer-button {
      padding: 8px 20px;
      border: 1px solid #007bff;
      border-radius: 4px;
      background-color: white;
      color: #007bff;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #e6f0ff;
      }

      &.selected {
        background-color: #007bff;
        color: white;
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
        
        // Get content after we have the country
        if (!this.content) {
          this.tridionService.getContent().subscribe(content => {
            this.content = content;
            this.loadQuestionsIfReady();
          });
        } else {
          this.loadQuestionsIfReady();
        }
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