import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";
import {AuthService} from "../core/auth.service";
declare var $: any;

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
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
export class SignInComponent implements OnInit, AfterViewInit {
  btnCreateAccount: any;
  btnLogin: any;
  txtEmail;
  height = 100;
  myParams: object = {};
  myStyle: object = {};
  pauseBackgroundMusic: boolean;
  playBackgroundMusic: boolean;
  state = 'inactive';
  width = 100;
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

  constructor(private router: Router, public auth: AuthService) {
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
  createAccount(){
    this.txtEmail = document.getElementById('inputEmail');
    const email = this.txtEmail.value;
    this.btnCreateAccount = document.getElementById('createAccount');
    const promise = this.auth.createAccountWithEmail(email);
  }
  signInWithEmail(){
    this.txtEmail = document.getElementById('inputEmail');
    const email = this.txtEmail.value;
    this.btnLogin = document.getElementById('loginButton');
    const promise = this.auth.loginUserWithEmail(email);

  }

}
