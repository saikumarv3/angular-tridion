import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TridionService, TridionContent } from '../services/tridion.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  content: TridionContent | null = null;

  constructor(private tridionService: TridionService) {}

  ngOnInit() {
    this.tridionService.getContent().subscribe(content => {
      this.content = content;
    });
  }
}
