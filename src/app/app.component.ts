import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TridionService, TridionContent } from './services/tridion.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    main {
      width: 100%;
      min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
      background-color: #f0f2f5;
      padding: 20px;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private tridionService: TridionService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.tridionService.getContent().subscribe(content => {
      if (content) {
        this.titleService.setTitle(content.appTitle);
      }
    });
  }
}
