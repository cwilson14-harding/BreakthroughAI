import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  start: boolean = false;
  rogue = true;
  logo = false;
  white = false;

  timeout;
  skip = false;

  constructor(public router: Router) { }

  ngOnInit() {
    // Start after 1 second + 1 second of startDelay
    if (!this.skip) {
      this.timeout = setTimeout(() => this.start = true, 100);
      this.onLogoComplete();
    }
  }
  onComplete () {
    if (!this.skip) {
      this.timeout = setTimeout(() => {
        this.rogue = false;
        this.logo = true;
      }, 1000);
    }
  }

  onLogoComplete() {
    if (!this.skip) {
      this.timeout = setTimeout(() => {
        if (!this.skip) {
          this.router.navigateByUrl('intro');
        }
      }, 5000);
    }
  }

  toHomePage() {
    this.skip = true;
    clearTimeout(this.timeout);
    this.router.navigateByUrl('home');
  }

}
