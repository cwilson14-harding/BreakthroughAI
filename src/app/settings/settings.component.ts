import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(public auth: AuthService, public db: AngularFirestore, private router: Router) {
  }

  ngOnInit() {
  }
  logOff() {
    this.auth.logout();
    this.router.navigateByUrl('home');
  }
}
