import { Component, OnInit } from '@angular/core';
import{AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from "rxjs/Observable";
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],

})
export class ChatComponent implements OnInit {
  messagesCollection: AngularFirestoreCollection<any[]>;
  messages: Observable<any[]>;
  showStyle = false;
  chatMessages: any;

  constructor(public afs: AngularFirestore) {
    this.chatMessages = this.afs.collection('chats').valueChanges();
  }

  ngOnInit() {
    this.getChatData();
  }

  getChatData() {
    this.messagesCollection = this.afs.collection<any>('games');
    this.messages = this.messagesCollection.valueChanges();
  }

  newMessage(message) {
    this.messagesCollection.add(message);
  }
}
