import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../core/auth.service';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

returnToLeaderboard() {
  this.router.navigateByUrl(('multiPlayerLobby'));
}

  returnToMenu(){
    this.router.navigateByUrl(('main-menu'));
  }
}
