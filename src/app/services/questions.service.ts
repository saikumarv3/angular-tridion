import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private selectedCountry = new BehaviorSubject<string>('');
  private selectedState = new BehaviorSubject<string>('');
  private selectedDob = new BehaviorSubject<{ day: string; month: string; year: string }>({ day: '', month: '', year: '' });
  private ageError = new BehaviorSubject<string>('');
  private questionErrors = new BehaviorSubject<{ [key: string]: string }>({});
  private canProceed = new BehaviorSubject<boolean>(true);

  // Available states
  readonly states = [
    'California',
    'New York',
    'Texas',
    'Florida'
  ];

  // Date options
  readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  readonly years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Common questions for all countries
  readonly commonQuestions = [
    'Do you have a valid passport?',
    'Have you traveled internationally before?',
    'Are you over 18 years old?',
    'Select your state of residence:'
  ];

  // California specific question
  readonly dobQuestion = 'Enter your date of birth:';

  // Country specific questions
  private countryQuestions: { [key: string]: string[] } = {
    'USA': [
      'Do you need a visa for entry?',
      'Have you completed ESTA registration?'
    ],
    'UK': [
      'Do you have proof of accommodation?',
      'Have you booked a return ticket?'
    ],
    'Canada': [
      'Have you obtained an eTA?',
      'Do you have travel insurance?'
    ],
    'Australia': [
      'Have you applied for an ETA?',
      'Have you declared any goods for customs?'
    ]
  };

  // Get all questions including conditional ones
  getQuestions(state: string): string[] {
    const questions = [...this.commonQuestions];
    if (state === 'California') {
      questions.push(this.dobQuestion);
    }
    return questions;
  }

  getSelectedCountry() {
    return this.selectedCountry.asObservable();
  }

  getSelectedState() {
    return this.selectedState.asObservable();
  }

  getSelectedDob() {
    return this.selectedDob.asObservable();
  }

  setSelectedCountry(country: string) {
    this.selectedCountry.next(country);
    // Only clear country-specific errors, not age errors
    const currentErrors = this.questionErrors.getValue();
    const newErrors: { [key: string]: string } = {};
    
    // Keep errors for common questions
    Object.keys(currentErrors).forEach(key => {
      if (this.commonQuestions.includes(key)) {
        newErrors[key] = currentErrors[key];
      }
    });
    
    this.questionErrors.next(newErrors);
  }

  setSelectedState(state: string) {
    this.selectedState.next(state);
    // Clear state-specific error when state is selected
    const currentErrors = this.questionErrors.getValue();
    const newErrors = { ...currentErrors };
    
    if (currentErrors['Select your state of residence:']) {
      delete newErrors['Select your state of residence:'];
    }
    
    // Clear DOB errors if state is not California
    if (state !== 'California' && currentErrors['Enter your date of birth:']) {
      delete newErrors['Enter your date of birth:'];
    }
    
    this.questionErrors.next(newErrors);
    
    // Reset DOB if state is not California
    if (state !== 'California') {
      this.selectedDob.next({ day: '', month: '', year: '' });
    }
  }

  getCountrySpecificQuestions(country: string): string[] {
    return this.countryQuestions[country] || [];
  }

  getAgeError() {
    return this.ageError.asObservable();
  }

  getQuestionErrors() {
    return this.questionErrors.asObservable();
  }

  getCanProceed() {
    return this.canProceed.asObservable();
  }

  // Validate age immediately when answered
  validateAge(isOver18: boolean) {
    if (!isOver18) {
      this.ageError.next('You must be at least 18 years old to proceed.');
    } else {
      this.ageError.next('');
    }
  }

  // Update answer and clear specific error
  updateAnswer(question: string, answer: boolean | string) {
    const currentErrors = this.questionErrors.getValue();
    if (currentErrors[question]) {
      const newErrors = { ...currentErrors };
      delete newErrors[question];
      this.questionErrors.next(newErrors);
    }
  }

  setSelectedDob(dob: { day: string; month: string; year: string }) {
    this.selectedDob.next(dob);
    // Clear DOB error when any part of the date is updated
    const currentErrors = this.questionErrors.getValue();
    if (currentErrors['Enter your date of birth:']) {
      const newErrors = { ...currentErrors };
      delete newErrors['Enter your date of birth:'];
      this.questionErrors.next(newErrors);
    }
  }

  // This method is called when Next button is clicked
  validateOnNext(answers: { [key: string]: boolean | string | { day: string; month: string; year: string } }) {
    const currentCountry = this.selectedCountry.getValue();
    const currentState = this.selectedState.getValue();
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};
    
    // Check if country is selected
    if (!currentCountry) {
      newErrors['country'] = 'Please select a country to proceed.';
      hasErrors = true;
    }

    // Check age requirement
    const ageQuestion = 'Are you over 18 years old?';
    if (answers[ageQuestion] === false) {
      this.ageError.next('You must be at least 18 years old to proceed.');
      hasErrors = true;
    }

    // Check if state is selected
    const stateQuestion = 'Select your state of residence:';
    if (!currentState) {
      newErrors[stateQuestion] = 'Please select your state of residence.';
      hasErrors = true;
    }

    // Check DOB if state is California
    const dobQuestion = 'Enter your date of birth:';
    if (currentState === 'California') {
      const dob = this.selectedDob.getValue();
      if (!dob.day || !dob.month || !dob.year) {
        newErrors[dobQuestion] = 'Please enter your complete date of birth.';
        hasErrors = true;
      }
    }

    // Check for unanswered questions
    const allQuestions = [...this.commonQuestions, ...this.getCountrySpecificQuestions(currentCountry)];
    const unansweredQuestions = allQuestions.filter(question => {
      if (question === stateQuestion) {
        return !currentState;
      }
      if (question === dobQuestion) {
        return currentState === 'California' && !answers[question];
      }
      return answers[question] === undefined;
    });
    
    if (unansweredQuestions.length > 0) {
      // Add each unanswered question as a separate error
      unansweredQuestions.forEach(question => {
        if (!newErrors[question]) {
          newErrors[question] = `Please answer: ${question}`;
        }
      });
      hasErrors = true;
    }

    // Update errors
    this.questionErrors.next(newErrors);

    return !hasErrors;
  }

  // Reset all selections and answers
  resetAll() {
    this.selectedCountry.next('');
    this.selectedState.next('');
    this.selectedDob.next({ day: '', month: '', year: '' });
    this.ageError.next('');
    this.questionErrors.next({});
    this.canProceed.next(true);
  }

  // Reset all selections except country
  resetExceptCountry() {
    this.selectedState.next('');
    this.selectedDob.next({ day: '', month: '', year: '' });
    this.ageError.next('');
    this.questionErrors.next({});
    this.canProceed.next(true);
  }
} 