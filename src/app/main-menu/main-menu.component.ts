import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import {PlayerData, PlayerType} from '../player-data';
import { GameService } from '../game.service';
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit, AfterViewInit {

  availableUsers: any;
  showSettings = false;
  state = 'inactive';
  myStyle: object = {};
  myParams: object = {};
  width = 100;
  height = 100;
  showTutorial = false;
  pauseBackgroundMusic: boolean;
  playBackgroundMusic: boolean;
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
  constructor(public auth: AuthService, private db: AngularFirestore, private router: Router, private gameService: GameService) {
    this.onlineUsers();
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
          color:'#2FB5F3', //colorPalette[Math.floor(Math.random() * colorPalette.length)],
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
    background.mouseParallax({ moveFactor: 5 });
  }

  loginGoogle() {
    this.auth.googleLogin();
  }

  logOff(user) {
    // this.updateUserStatus(user);
    this.auth.logout();
    this.router.navigateByUrl('home');
  }

  // updateUserStatus(user) {
  //   this.auth.updateUserStatus(user);
  // }

  onlineUsers() {
    this.availableUsers = this.auth.viewOnlineUsers();
  }

  startGame(uid, name) {
    alert('Starting a game with ' + name);
  }

  toHome() {
    this.router.navigateByUrl('home');
  }
  goToMulti(user) {
    this.auth.updateGameTypeMulti(user);
   // alert(userId);
    this.router.navigateByUrl('multiPlayerLobby');
  }

  playGame() {
    const playerOne = new PlayerData('Rogue Entertainment', '', PlayerType.Local);
    const playerTwo = new PlayerData('Jack', '', PlayerType.AI);
    this.gameService.newGame(playerOne, playerTwo);
    // this.router.navigateByUrl('single-setup');
     this.router.navigateByUrl('board');
  }
  // set settings to true. settings div will appear
  goToSettings() {
    this.showSettings = true;
  }
  goToTutorial() {
    this.showTutorial = true;
  }
  // settings & Tutorial is now closed
  goBack() {
    this.showSettings = false;
    this.showTutorial = false;
  }

}
