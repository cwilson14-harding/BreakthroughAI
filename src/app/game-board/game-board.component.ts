import {Component, OnInit, EventEmitter} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {Coordinate} from '../models/game-core/coordinate';
import {AuthService, Game, User} from '../core/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import {Player} from '../models/player';
import {LocalPlayer} from '../models/local-player';
import {AIPlayer} from '../models/ai-player';
import { GameService } from '../game.service';
import {PlayerData, PlayerType} from '../player-data';
import {Board} from '../models/board';
import {NetworkPlayer} from '../models/network-player';
import {Move} from '../models/move';
import {Router} from '@angular/router';
import {HostListener} from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})

export class GameBoardComponent implements OnInit {

  user: Observable<User>;
  game: AngularFirestoreDocument<Game>;
  games: any;
  currentUserName: any;
  player1: Player;
  player2: Player;
  board: Board;
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

  constructor(public db: AngularFirestore, private router: Router, public auth: AuthService, public afAuth: AngularFireAuth, private gameService: GameService) {
    this.board = new Board();
    this.board.newGame();

    this.currentUserName = this.afAuth.auth.currentUser.displayName;
    // this.board = db.collection('board').valueChanges();
    // Compare the user.uid field with the game.creatorId field.
    // this.games = this.db.collection('games', ref => ref.where('creatorName', '==', this.currentUserName));
    this.games = this.db.collection('games').valueChanges();
    if (this.gameService.gameId !== '') {
      this.game = this.db.collection('games').doc<Game>(this.gameService.gameId);
    }

    const p1 = this.gameService.playerOne;
    const p2 = this.gameService.playerTwo;

    switch (p1.type) {
      case PlayerType.AI: this.player1 = new AIPlayer(); break;
      case PlayerType.Local: this.player1 = new LocalPlayer(1); break;
      case PlayerType.Network: this.player1 = new NetworkPlayer(this.game); break;
    }

    switch (p2.type) {
      case PlayerType.AI: this.player2 = new AIPlayer(); break;
      case PlayerType.Local: this.player2 = new LocalPlayer(2); break;
      case PlayerType.Network: this.player2 = new NetworkPlayer(this.game); break;
    }

    this.getMove();

  }

  /* movePiece: function(){}
     Moves a piece from one coordinate to the other if the move was valid.
     Returns a boolean that is true if the move was made, or false if the move was not valid.
  */
  getMove() {
    const currentPlayer = this.currentPlayer;
    if (currentPlayer !== undefined) {
      const movePromise: Promise<Move> = currentPlayer.getMove(this);

      movePromise.then((move: Move) => {
        // Make the move on the game board.
        this.board.makeMove(move);

        // Reset highlighting
        this.board.clearHighlighting();
        this.board.boardClass[move.from.row][move.from.column] += ' lastMove';
        this.board.boardClass[move.to.row][move.to.column] += ' lastMove';

        // Check if the game is over.
        const winner: number = this.board.isGameFinished();
        if (winner) {
          const winnerData: PlayerData = (winner === 1) ? this.gameService.playerOne : this.gameService.playerTwo;
          setTimeout(() => {
            // this.router.navigateByUrl(('game-over'));
            // TODO: Go to game over screen.
            alert(winnerData.name + ' [' + winner + '] has won!');
            this.router.navigateByUrl(('main-menu'));
          }, 1000);
        } else {
          this.getMove();
        }
      }, () => {
        alert('Move rejected');
      });
    }
  }

  get currentPlayer(): Player {
    if (this.board.playerTurn === 1) {
      return this.player1;
    } else if (this.board.playerTurn === 2) {
      return this.player2;
    } else {
      return undefined;
    }
  }

  newGameClicked(Null: null) {
    // Initialize variables.
    this.board.newGame();

    if (this.player1 instanceof LocalPlayer) {
      this.player1 = new LocalPlayer(1);
    } else if (this.player1 instanceof AIPlayer) {
      this.player1 = new AIPlayer();
    }

    if (this.player2 instanceof LocalPlayer) {
      this.player2 = new LocalPlayer(2);
    } else if (this.player2 instanceof AIPlayer) {
      this.player2 = new AIPlayer();
    }

    // Start the game.
    this.getMove();
  }

  selectRowCol(target: [number, number]) {
    const coord: Coordinate = new Coordinate(target[0], target[1]);
    this.selectPiece(coord);
  }

  selectPiece(target: Coordinate) {
    const currentPlayer = this.currentPlayer;
    this.board.clearHighlighting();
    if (currentPlayer instanceof LocalPlayer) {
      const localPlayer: LocalPlayer = currentPlayer as LocalPlayer;
      localPlayer.selectPiece(target);
      this.board.selectedCoordinate = localPlayer.selectedCoordinate;

      if (localPlayer.selectedCoordinate !== undefined) {
        this.board.boardClass[localPlayer.selectedCoordinate.row][localPlayer.selectedCoordinate.column] += ' selected';
        for (const coord of this.board.findAvailableMoves(localPlayer.selectedCoordinate)) {
          this.board.boardClass[coord.row][coord.column] += ' potentialMove';
        }
      }
    }

    // Ignore if a non-local player.
  }
  showChatClicked(Null: null) {
    const div = document.getElementById('chatContainer');
    if (div.style.display !== 'none') {
      div.style.display = 'none';
    } else {
      div.style.display = 'block';
    }
  }
  getCurrName() {
    // this.currentUserName = this.afAuth.auth.currentUser.displayName;
    // alert(this.currentUserName);
    this.games = this.db.collection('games', ref => ref.where('creatorName', '==', this.currentUserName));
  }

  getCurrentGame(user, game) {
    if (user.displayName === game.creatorName) {
      alert('This is your game.');
    } else {
      alert('This is ' + game.creatorName + ' game.');
    }
  }
  forfeitClicked(Null: null) {
    // TODO: CONFIRM before forfeit
    // this.router.navigateByUrl(('game-over'));
    this.router.navigateByUrl(('main-menu'));
  }

  ngOnInit() {}
}
