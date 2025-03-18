import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TridionContent {
  // Common content
  appTitle: string;
  headerTitle: string;
  footerText: string;

  // Home page content
  homeTitle: string;
  countrySelectLabel: string;
  countryPlaceholder: string;
  countries: string[];

  // Questions page content
  questionsTitle: string;
  commonQuestions: {
    title: string;
    questions: {
      passport: string;
      travel: string;
      water: string;
      age: string;
      state: string;
      dob: string;
    };
  };
  countrySpecificQuestions: {
    title: string;
    questions: {
      [key: string]: string[];
    };
  };
  states: string[];
  buttonLabels: {
    yes: string;
    no: string;
    next: string;
    submit: string;
    back: string;
  };
  errorMessages: {
    required: string;
    age: string;
    state: string;
    dob: string;
    country: string;
  };
  dateLabels: {
    month: string;
    day: string;
    year: string;
    placeholder: {
      month: string;
      day: string;
      year: string;
    };
  };

  // Terms page content
  termsTitle: string;
  termsText: string[];
  agreeText: string;
  successMessage: string;

  verificationPage: {
    title: string;
    message: string;
    questions: {
      [key: string]: string[];
    };
    errorMessages: {
      required: string;
    };
  };

  // Places to visit page content
  placesToVisit: {
    title: string;
    message: string;
    errorMessages: {
      required: string;
    };
    places: {
      [country: string]: Array<{
        name: string;
        description: string;
        mustVisit: boolean;
        bestTimeToVisit: string;
      }>;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class TridionService {
  private content: TridionContent;
  private contentSubject: BehaviorSubject<TridionContent>;
  private isInitialized = false;

  constructor() {
    // Initialize with mock content
    this.content = this.getMockContent();
    this.contentSubject = new BehaviorSubject<TridionContent>(this.content);
    this.isInitialized = true;
  }

  // Get the cached content synchronously
  getCachedContent(): TridionContent {
    return this.content;
  }

  // Get content as an observable (for components that need to react to content changes)
  getContent(): Observable<TridionContent> {
    if (!this.isInitialized) {
      this.content = this.getMockContent();
      this.contentSubject.next(this.content);
      this.isInitialized = true;
    }
    return this.contentSubject.asObservable();
  }

  // This would typically come from your Tridion CMS
  private getMockContent(): TridionContent {
    return {
      // Common content
      appTitle: 'Travel Visa Application',
      headerTitle: 'International Travel Application',
      footerText: '© 2024 Travel Visa Application. All rights reserved.',

      // Home page content
      homeTitle: 'Welcome to Travel Visa Application',
      countrySelectLabel: 'Select your destination country',
      countryPlaceholder: 'Choose a country',
      countries: ['USA', 'UK', 'Canada', 'Australia'],

      // Questions page content
      questionsTitle: 'Travel Questions',
      commonQuestions: {
        title: 'Common Questions',
        questions: {
          passport: 'Do you have a valid passport?',
          travel: 'Have you traveled internationally before?',
          water: 'Are you on water?',
          age: 'Are you over 18 years old?',
          state: 'Select your state of residence:',
          dob: 'Enter your date of birth:'
        }
      },
      countrySpecificQuestions: {
        title: 'Country Specific Questions',
        questions: {
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
        }
      },
      states: [
        'California',
        'New York',
        'Texas',
        'Florida'
      ],
      buttonLabels: {
        yes: 'Yes',
        no: 'No',
        next: 'Next',
        submit: 'Submit Application',
        back: 'Back'
      },
      errorMessages: {
        required: 'Please answer: ',
        age: 'You must be at least 18 years old to proceed.',
        state: 'Please select your state of residence.',
        dob: 'Please enter your complete date of birth.',
        country: 'Please select a country to proceed.'
      },
      dateLabels: {
        month: 'Month',
        day: 'Day',
        year: 'Year',
        placeholder: {
          month: 'Select month',
          day: 'Select day',
          year: 'Select year'
        }
      },

      // Terms page content
      termsTitle: 'Terms and Conditions',
      termsText: [
        'I confirm that all information provided in this application is accurate and complete.',
        'I understand that any false statements may result in the rejection of my application.',
        'I agree to comply with all applicable laws and regulations of the destination country.',
        'I acknowledge that I am responsible for obtaining all necessary travel documents.',
        'I confirm that I have read and understood the privacy policy and terms of service.'
      ],
      agreeText: 'I agree to all terms and conditions',
      successMessage: 'Application submitted successfully!',

      verificationPage: {
        title: 'Welcome!',
        message: 'Please answer these verification questions before proceeding.',
        questions: {
          'USA': [
            'Is the Grand Canyon located in Arizona?',
            'Is Washington D.C. the capital of the United States?'
          ],
          'UK': [
            'Is Big Ben located in London?',
            'Is the River Thames the longest river in the UK?'
          ],
          'Canada': [
            'Is Toronto the capital of Canada?',
            'Is maple syrup a traditional Canadian product?'
          ],
          'Australia': [
            'Is the Great Barrier Reef located in Australia?',
            'Is Canberra the capital city of Australia?'
          ]
        },
        errorMessages: {
          required: 'Please answer all verification questions to proceed.'
        }
      },

      // Add places to visit content
      placesToVisit: {
        title: 'Places You Might Want to Visit',
        message: 'Please tell us if you would be interested in visiting these popular destinations.',
        errorMessages: {
          required: 'Please answer all questions about places you would like to visit.'
        },
        places: {
          'United States': [
            {
              name: 'New York City',
              description: 'Experience the vibrant culture, iconic landmarks, and diverse food scene of the Big Apple.',
              mustVisit: true,
              bestTimeToVisit: 'Spring (April-June) or Fall (September-November)'
            },
            {
              name: 'Grand Canyon',
              description: 'Witness one of the world\'s most spectacular natural wonders in Arizona.',
              mustVisit: true,
              bestTimeToVisit: 'March to May or September to November'
            },
            {
              name: 'San Francisco',
              description: 'Visit the Golden Gate Bridge, ride cable cars, and explore the city\'s unique neighborhoods.',
              mustVisit: true,
              bestTimeToVisit: 'September to November'
            }
          ],
          'United Kingdom': [
            {
              name: 'London',
              description: 'Explore historic landmarks, world-class museums, and diverse cultural experiences.',
              mustVisit: true,
              bestTimeToVisit: 'March to May'
            },
            {
              name: 'Edinburgh',
              description: 'Discover Scotland\'s capital with its medieval Old Town and elegant Georgian New Town.',
              mustVisit: true,
              bestTimeToVisit: 'June to August'
            },
            {
              name: 'Bath',
              description: 'Visit the Roman Baths and admire the Georgian architecture in this UNESCO World Heritage city.',
              mustVisit: true,
              bestTimeToVisit: 'April to October'
            }
          ],
          'Canada': [
            {
              name: 'Banff National Park',
              description: 'Experience the stunning Rocky Mountains, pristine lakes, and abundant wildlife.',
              mustVisit: true,
              bestTimeToVisit: 'June to August or December to March'
            },
            {
              name: 'Vancouver',
              description: 'Enjoy the perfect blend of urban life and outdoor activities in this coastal city.',
              mustVisit: true,
              bestTimeToVisit: 'June to September'
            },
            {
              name: 'Quebec City',
              description: 'Step into a piece of Europe in North America with its French heritage and historic architecture.',
              mustVisit: true,
              bestTimeToVisit: 'June to September or December to February'
            }
          ]
        }
      }
    };
  }
} 