import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TridionService, TridionContent } from '../services/tridion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  content: TridionContent | null = null;

  constructor(private tridionService: TridionService) {}

  ngOnInit() {
    this.content = this.tridionService.getCachedContent();
  }
}
