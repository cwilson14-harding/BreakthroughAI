import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
// import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-multi-setup',
  templateUrl: './multi-setup.component.html',
  styleUrls: ['./multi-setup.component.scss']
})
export class MultiSetupComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToBoard(){
    this.router.navigateByUrl(('board'));
  }

  returnToMenu(){
    this.router.navigateByUrl(('multiPlayerLobby'));
  }

}
