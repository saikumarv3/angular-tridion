import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TridionService, TridionContent } from './tridion.service';

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

  // Date options
  readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  readonly days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  readonly years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  constructor(private tridionService: TridionService) {}

  // Get all questions including conditional ones
  getQuestions(state: string): string[] {
    const content = this.tridionService.getCachedContent();
    const questions = [
      content.commonQuestions.questions.passport,
      content.commonQuestions.questions.travel,
      content.commonQuestions.questions.age,
      content.commonQuestions.questions.state
    ];
    if (state === 'California') {
      questions.push(content.commonQuestions.questions.dob);
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
    const content = this.tridionService.getCachedContent();
    // Only clear country-specific errors, not age errors
    const currentErrors = this.questionErrors.getValue();
    const newErrors: { [key: string]: string } = {};
    
    // Keep errors for common questions
    Object.keys(currentErrors).forEach(key => {
      if (Object.values(content.commonQuestions.questions).includes(key)) {
        newErrors[key] = currentErrors[key];
      }
    });
    
    this.questionErrors.next(newErrors);
  }

  setSelectedState(state: string) {
    this.selectedState.next(state);
    const content = this.tridionService.getCachedContent();
    // Clear state-specific error when state is selected
    const currentErrors = this.questionErrors.getValue();
    const newErrors = { ...currentErrors };
    
    if (currentErrors[content.commonQuestions.questions.state]) {
      delete newErrors[content.commonQuestions.questions.state];
    }
    
    // Clear DOB errors if state is not California
    if (state !== 'California' && currentErrors[content.commonQuestions.questions.dob]) {
      delete newErrors[content.commonQuestions.questions.dob];
    }
    
    this.questionErrors.next(newErrors);
    
    // Reset DOB if state is not California
    if (state !== 'California') {
      this.selectedDob.next({ day: '', month: '', year: '' });
    }
  }

  getCountrySpecificQuestions(country: string): string[] {
    const content = this.tridionService.getCachedContent();
    return content.countrySpecificQuestions.questions[country] || [];
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
    const content = this.tridionService.getCachedContent();
    if (!isOver18) {
      this.ageError.next(content.errorMessages.age);
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
    const content = this.tridionService.getCachedContent();
    // Clear DOB error when any part of the date is updated
    const currentErrors = this.questionErrors.getValue();
    if (currentErrors[content.commonQuestions.questions.dob]) {
      const newErrors = { ...currentErrors };
      delete newErrors[content.commonQuestions.questions.dob];
      this.questionErrors.next(newErrors);
    }
  }

  // This method is called when Next button is clicked
  validateOnNext(answers: { [key: string]: boolean | string | { day: string; month: string; year: string } }) {
    const content = this.tridionService.getCachedContent();
    const currentCountry = this.selectedCountry.getValue();
    const currentState = this.selectedState.getValue();
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};
    
    // Check if country is selected
    if (!currentCountry) {
      newErrors['country'] = content.errorMessages.country;
      hasErrors = true;
    }

    // Check age requirement
    const ageQuestion = content.commonQuestions.questions.age;
    if (answers[ageQuestion] === false) {
      this.ageError.next(content.errorMessages.age);
      hasErrors = true;
    }

    // Check if state is selected
    const stateQuestion = content.commonQuestions.questions.state;
    if (!currentState) {
      newErrors[stateQuestion] = content.errorMessages.state;
      hasErrors = true;
    }

    // Check DOB if state is California
    const dobQuestion = content.commonQuestions.questions.dob;
    if (currentState === 'California') {
      const dob = this.selectedDob.getValue();
      if (!dob.day || !dob.month || !dob.year) {
        newErrors[dobQuestion] = content.errorMessages.dob;
        hasErrors = true;
      }
    }

    // Check for unanswered questions
    const allQuestions = [
      ...Object.values(content.commonQuestions.questions),
      ...this.getCountrySpecificQuestions(currentCountry)
    ];
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
          newErrors[question] = `${content.errorMessages.required}${question}`;
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

  setAnswer(question: string, answer: boolean | string | { day: string; month: string; year: string }) {
    const content = this.tridionService.getCachedContent();
    // Check age requirement immediately
    if (question === content.commonQuestions.questions.age) {
      if (answer === false) {
        this.ageError.next(content.errorMessages.age);
        this.canProceed.next(false);
      } else {
        this.ageError.next('');
        this.canProceed.next(true);
      }
    }

    // Clear error for this specific question
    const currentErrors = this.questionErrors.value;
    delete currentErrors[question];
    this.questionErrors.next(currentErrors);
  }
} 