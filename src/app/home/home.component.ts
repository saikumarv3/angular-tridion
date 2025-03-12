import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '../services/questions.service';
import { CountryQuestionsComponent } from '../country-questions/country-questions.component';
import { TridionService, TridionContent } from '../services/tridion.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [CommonModule, FormsModule, CountryQuestionsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  selectedCountry: string = '';
  content: TridionContent | null = null;

  constructor(
    private questionsService: QuestionsService,
    private tridionService: TridionService
  ) {}

  ngOnInit() {
    this.tridionService.getContent().subscribe(content => {
      this.content = content;
    });
  }

  onCountryChange() {
    this.questionsService.setSelectedCountry(this.selectedCountry);
  }
}