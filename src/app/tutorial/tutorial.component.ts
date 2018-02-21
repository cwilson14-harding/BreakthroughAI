import {Component, NgModule, OnInit} from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import {NgxSlideshowModule} from 'ngx-slideshow';
import {TextAnimator} from '../text-animator';
declare var $: any;

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
@NgModule({
  imports: [NgxSlideshowModule]
})
export class TutorialComponent implements OnInit {
  textAnimator1: TextAnimator = new TextAnimator();
  textAnimator2: TextAnimator = new TextAnimator();
  textAnimator3: TextAnimator = new TextAnimator();
  textAnimator4: TextAnimator = new TextAnimator();
  textAnimator5: TextAnimator = new TextAnimator();

  constructor(public auth: AuthService, public db: AngularFirestore, private router: Router) {

  }

  restartTextAnimation() {

    this.textAnimator1.start(document.getElementById('messenger'),
      'The game starts with two players and the first two rows filled with their pieces.');
    this.textAnimator2.start(document.getElementById('messenger2'),
      'A player can move one piece forward or diagonally forward, once per turn.');
    this.textAnimator3.start(document.getElementById('messenger3'),
      'A player can capture an opponent\'s piece if and only if the opponent is in a forward diagonal space.');
    this.textAnimator4.start(document.getElementById('messenger4'),
      'The main objective of the game is to get one of your pieces into the opponent\'s home row.');
    this.textAnimator5.start(document.getElementById('messenger5'),
      'The only other way to win is to capture all of your opponent\'s pieces.');
  }

  ngOnInit() {
    this.restartTextAnimation()
  }
}
