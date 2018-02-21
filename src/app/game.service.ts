import { Injectable } from '@angular/core';
import {PlayerData} from './player-data';

@Injectable()
export class GameService {
  gameId: string;
  playerOne: PlayerData;
  playerTwo: PlayerData;

  constructor() { }

  newGame(playerOne: PlayerData, playerTwo: PlayerData, gameId = '') {
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.gameId = gameId;
  }

}



