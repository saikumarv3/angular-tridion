import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryQuestionsComponent } from './country-questions.component';

describe('CountryQuestionsComponent', () => {
  let component: CountryQuestionsComponent;
  let fixture: ComponentFixture<CountryQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
