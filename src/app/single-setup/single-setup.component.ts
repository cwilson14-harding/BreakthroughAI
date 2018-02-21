import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-single-setup',
  templateUrl: './single-setup.component.html',
  styleUrls: ['./single-setup.component.scss']
})
export class SingleSetupComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToBoard(){
    this.router.navigateByUrl(('board'));
  }

  returnToMenu(){
    this.router.navigateByUrl(('main-menu'));
  }


}
