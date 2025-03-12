import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private ageError = new BehaviorSubject<string>('');
  private isAgeValid = new BehaviorSubject<boolean>(true);
  private allQuestionsAnswered = new BehaviorSubject<boolean>(false);

  getAgeError() {
    return this.ageError.asObservable();
  }

  getIsAgeValid() {
    return this.isAgeValid.asObservable();
  }

  getAllQuestionsAnswered() {
    return this.allQuestionsAnswered.asObservable();
  }

  validateAge(answers: { [key: string]: boolean }) {
    const ageQuestion = 'Are you over 18 years old?';
    const isOver18 = answers[ageQuestion];
    
    if (isOver18 === false) {
      this.ageError.next('You must be at least 18 years old to proceed.');
      this.isAgeValid.next(false);
    } else {
      this.ageError.next('');
      this.isAgeValid.next(true);
    }
  }

  validateAllQuestions(answers: { [key: string]: boolean }, totalQuestions: number) {
    const answeredQuestions = Object.keys(answers).length;
    this.allQuestionsAnswered.next(answeredQuestions === totalQuestions);
  }
} 