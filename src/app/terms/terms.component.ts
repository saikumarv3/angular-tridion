import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TridionService, TridionContent } from '../services/tridion.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Error Messages -->
    <div class="error-messages" *ngIf="errorMessage">
      <div class="error-card">
        {{ errorMessage }}
      </div>
    </div>

    <div class="terms-container" *ngIf="content">
      <h2>{{ content.termsTitle }}</h2>
      
      <div *ngIf="successMessage" class="success-message">
        {{ content.successMessage }}
      </div>

      <div class="terms-list">
        <div *ngFor="let term of content.termsText; let i = index" class="term-item">
          <p>{{ i + 1 }}. {{ term }}</p>
        </div>
      </div>

      <div class="agreement-section">
        <label class="checkbox-label">
          <input type="checkbox" 
                 [(ngModel)]="agreed">
          <span>{{ content.agreeText }}</span>
        </label>
      </div>

      <div class="button-container">
        <button class="back-button" 
                (click)="onBack()">
          {{ content.buttonLabels.back }}
        </button>
        <button class="submit-button" 
                (click)="onSubmit()">
          {{ content.buttonLabels.submit }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .terms-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 24px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: bold;
    }

    .terms-list {
      margin-bottom: 2rem;
    }

    .term-item {
      margin-bottom: 16px;
      padding: 16px;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .term-item p {
      margin: 0;
      line-height: 1.5;
    }

    .agreement-section {
      margin: 2rem 0;
      padding: 20px;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label span {
      font-weight: bold;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 0 1rem;
    }

    .back-button {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #5a6268;
      }
    }

    .submit-button {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #0056b3;
      }
    }
  `]
})
export class TermsComponent implements OnInit {
  content: TridionContent | null = null;
  agreed = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private tridionService: TridionService
  ) {}

  ngOnInit() {
    this.content = this.tridionService.getCachedContent();
  }

  onBack() {
    this.router.navigate(['/verification']);
  }

  onSubmit() {
    if (!this.agreed) {
      this.errorMessage = 'Please agree to the terms and conditions to proceed.';
      this.successMessage = '';
    } else {
      this.successMessage = this.content?.successMessage || 'Success';
      this.errorMessage = '';
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }
} 