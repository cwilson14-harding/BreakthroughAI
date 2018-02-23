import {Component, OnInit, EventEmitter} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {Coordinate} from '../models/game-core/coordinate';
import {AuthService, Game, User} from '../core/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import {Player} from '../models/player';
import {LocalPlayer} from '../models/local-player';
import { GameService } from '../game.service';
import {PlayerData, PlayerType} from '../player-data';
import {Board} from '../models/board';
import {NetworkPlayer} from '../models/network-player';
import {Move} from '../models/move';
import {Router} from '@angular/router';
import {HostListener} from '@angular/core';
import {AIProjectZen} from '../models/ai-project-zen';
import {NeuralNetwork} from '../models/ai/neural-network';
import {ProjectZenCore} from '../models/ai/project-zen-core';
import {AIMCTSProjectZen} from '../models/ai-mcts-project-zen';
import {MCTSRandom} from '../models/ai/mcts-random/mcts-random';
import {AIPlayerMCTSRandom} from '../models/ai-player-mcts-random';
import {AIPlayerMCTSDefensive} from '../models/ai-player-mcts-def';

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
	history: Move[] = [];
	neuralNetwork: NeuralNetwork = new NeuralNetwork(ProjectZenCore.PROJECT_ZEN_CORE);
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
		console.log(this.board);

		// this.currentUserName = this.afAuth.auth.currentUser.displayName;
		// this.board = db.collection('board').valueChanges();
		// Compare the user.uid field with the game.creatorId field.
		// this.games = this.db.collection('games', ref => ref.where('creatorName', '==', this.currentUserName));
		gameService.newGame(
			new PlayerData('CJ', '', PlayerType.AI),
			new PlayerData('Jack', '', PlayerType.AI),
			'');
		this.games = this.db.collection('games').valueChanges();
		if (this.gameService.gameId !== '') {
			this.game = this.db.collection('games').doc<Game>(this.gameService.gameId);
		}

		this.newGame();

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
				this.history.push(move);

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
						//alert(winnerData.name + ' [' + winner + '] has won!');
						// this.router.navigateByUrl(('main-menu'));

						// Train the losing AI.
						if (winner === 1) {
							this.neuralNetwork.trainGame(this.history, true);
						} else {
							this.neuralNetwork.trainGame(this.history, false);
						}
						this.newGameClicked();
					}, 1000);
				} else {
					this.getMove();
				}
			}, () => {
				alert('Move rejected');
			});
		}
	}

	newGame() {
		const p1 = this.gameService.playerOne;
		const p2 = this.gameService.playerTwo;

		switch (p1.type) {
			case PlayerType.AI: this.player1 = new AIProjectZen(this.neuralNetwork); break;
			case PlayerType.Local: this.player1 = new LocalPlayer(1); break;
			case PlayerType.Network: this.player1 = new NetworkPlayer(this.game); break;
		}

		switch (p2.type) {
			case PlayerType.AI:
				switch (Math.floor(Math.random() * 6)) {
					case 0: this.player2 = new AIProjectZen(this.neuralNetwork); break;
					case 1: this.player2 = new AIProjectZen(); break;
					case 2: this.player2 = new AIMCTSProjectZen(this.neuralNetwork); break;
					case 3: this.player2 = new AIMCTSProjectZen(); break;
					case 4: this.player2 = new AIPlayerMCTSRandom(); break;
					case 5: this.player2 = new AIPlayerMCTSDefensive(); break;
				}
				break;
			case PlayerType.Local: this.player2 = new LocalPlayer(2); break;
			case PlayerType.Network: this.player2 = new NetworkPlayer(this.game); break;
		}
	}

	trainClicked() {
		this.neuralNetwork.resetTraining();
		for (const trainingCase of ProjectZenCore.PROJECT_ZEN_TRAINING) {
			this.neuralNetwork.trainCase(trainingCase[0], trainingCase[1]);
		}
		this.neuralNetwork.applyTraining(.2);
	}

	saveClicked() {
		const uri = 'data:application/octet-stream,' + encodeURIComponent(JSON.stringify(this.neuralNetwork.saveNetwork()));
		location.href = uri;
		// console.log(this.neuralNetwork.saveNetwork());
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

	newGameClicked() {
		// Initialize variables.
		this.board.newGame();
		this.history = [];
		this.newGame();

		/*if (this.player1 instanceof LocalPlayer) {
			this.player1 = new LocalPlayer(1);
		} else if (this.player1 instanceof AIProjectZen) {
			this.player1 = new AIProjectZen();
		}

		if (this.player2 instanceof LocalPlayer) {
			this.player2 = new LocalPlayer(2);
		} else if (this.player2 instanceof AIProjectZen) {
			this.player2 = new AIProjectZen();
		}*/

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
