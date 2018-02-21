import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent implements OnInit {
  timeout;

  constructor(private router: Router) { }

  ngOnInit() {
    this.timeout = setTimeout(() => {
      this.router.navigateByUrl('home');
    }, 16500);
  }

  toHomePage() {
    clearTimeout(this.timeout);
    this.router.navigateByUrl('home');
  }
}
