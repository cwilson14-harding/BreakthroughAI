import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFirestore} from "angularfire2/firestore";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";
import {AuthService} from "../core/auth.service";
declare var $: any;

@Component({
  selector: 'app-guest-info',
  templateUrl: './guest-info.component.html',
  styleUrls: ['./guest-info.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(100)'})),
      transition('void => *', [
        style({transform: 'translateX(-50%)'}),
        animate(700)
      ]),
      transition('* => void', [
        animate(300, style({transform: 'translateX(10%)'}))
      ])
    ])
  ]
})
export class GuestInfoComponent implements OnInit {
  btnContinue;
  txtDisplayName;
  height = 100;
  myParams: object = {};
  myStyle: object = {};
  pauseBackgroundMusic: boolean;
  playBackgroundMusic: boolean;
  state = 'inactive';
  width = 100;

  // avatar Css bools
  avatar1Selected = true;
  avatar2Selected = false;
  avatar3Selected = false;
  currentPic: string;

  @HostListener('document: keypress', ['$event'])
  playPauseBackgroundMusic(event: KeyboardEvent) {
    const audio = document.getElementById('audioPlayer') as any;
    const key = event.keyCode;
    if (key === 32 && this.playBackgroundMusic) {
      this.pauseBackgroundMusic = true;
      this.playBackgroundMusic = false;
      audio.pause();
    } else if (key === 32 && !this.playBackgroundMusic) {
      this.pauseBackgroundMusic = false;
      this.playBackgroundMusic = true;
      audio.play();
    }
  }

  constructor(private router: Router, public auth: AuthService, public afs: AngularFirestore) {
    this.pauseBackgroundMusic = false;

  }

  toggleState() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }

  ngOnInit() {
    this.myStyle = {
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'z-index': 1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };
    //const colorPalette: string[] = ['#18DD00', '#E1C829', '#2FB5F3', '#FC82C3', '#1E023F'];
    this.myParams = {
      particles: {
        number: {
          value: 200,
        },
        color: {
          value: '#ff0000'
        },
        shape: {
          type: 'triangle',
        },
        line_linked: {
          // Neon color palette: http://www.colourlovers.com/palette/2652343/*Neon-Palette*
          color: '#2FB5F3', //colorPalette[Math.floor(Math.random() * colorPalette.length)]
          opacity: .6,
          width: 2
        }
      }
    };
  }

  ngAfterViewInit() {
    // Initialize parallax background.
    // https://www.jqueryscript.net/animation/Interactive-Mouse-Hover-Parallax-Effect-with-jQuery-Mouse-Parallax.html
    const background = $('.backImg');
    background.mouseParallax({moveFactor: 5});
  }
  continue() {

    if (this.avatar1Selected == true) {
      this.currentPic = 'assets/avatars/circle.png';
    } else if (this.avatar2Selected == true) {
      this.currentPic = 'assets/avatars/virus.png';
    } else if (this.avatar3Selected == true) {
      this.currentPic = 'assets/avatars/virus2.png';
    } else {
      alert('Please choose an avatar!');
    }

    this.txtDisplayName = document.getElementById('inputGuestName');
    const displayName = this.txtDisplayName.value;

    let currUserId = this.auth.getCurrentUser();
    this.afs.collection('users').doc(currUserId).set({
      displayName: displayName,
      uid: currUserId,
      pic: this.currentPic
    }).then(() => {
      this.router.navigateByUrl('main-menu');
    });
  }

  circleSelected() {
    this.avatar1Selected = true;
    this.avatar2Selected = false;
    this.avatar3Selected = false;
  }
  virusSelected() {
    this.avatar1Selected = false;
    this.avatar2Selected = true;
    this.avatar3Selected = false;
  }
  virus2Selected() {
    this.avatar1Selected = false;
    this.avatar2Selected = false;
    this.avatar3Selected = true;
  }

}
