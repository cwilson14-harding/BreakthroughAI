import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFirestore} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-networking',
  templateUrl: './networking.component.html',
  styleUrls: ['./networking.component.scss']
})
export class NetworkingComponent implements OnInit {
  gameRef;
  users;

  constructor(private Auth: AngularFireAuth, private db: AngularFirestore) {
    this.users = this.db.collection('users').valueChanges();
  }
  ngOnInit() {
    this.gameRef = this.db.collection('game');
  }
  createGame() {
    const user = this.Auth.auth.currentUser;
    const currentGame = {
      creator: {uid: user.uid, displayName: user.displayName},
      joined: true
    };
    this.gameRef.push().set(currentGame);
  }
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }
  oAuthLogin(provider) {
    this.Auth.auth.signInWithPopup(provider);
  }
  joinGame(key) {
    const user = this.Auth.auth.currentUser;
    this.gameRef.child(key);
  }
}
