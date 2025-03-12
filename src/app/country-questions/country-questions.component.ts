import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionsService } from '../services/questions.service';

@Component({
  selector: 'country-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-questions.component.html',
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