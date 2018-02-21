var mcts;
onmessage = function (ev) {
    mcts = new MCTSWorker();
    var task = ev.data.split('-');
    var ms = +task[0];
    var state = task[1];
    var results = [0, 0];
    // https://stackoverflow.com/a/14968331
    // Run the loop for the specified number of ms.
    var startTime = Date.now();
    while (Date.now() - startTime < ms) {
        ++results[mcts.playGame(state) - 1];
    }
    postMessage(results.join('-'));
};
var MCTSWorker = /** @class */ (function () {
    function MCTSWorker() {
        this.board = new Board();
    }
    MCTSWorker.chooseRandom = function (a) {
        if (a.length > 0) {
            var index = Math.floor((Math.random() * a.length));
            return a[index];
        }
        else {
            return null;
        }
    };
    MCTSWorker.chooseRandomWeighted = function (weightedArray) {
        var items = [];
        for (var _i = 0, weightedArray_1 = weightedArray; _i < weightedArray_1.length; _i++) {
            var item = weightedArray_1[_i];
            for (var i = 0; i < item[1]; ++i) {
                items.push(item[0]);
            }
        }
        var rand = Math.floor(Math.random() * items.length);
        return items[rand];
    };
    MCTSWorker.chooseMove = function (board) {
        var possibleMoves = this.findPossibleMoves(board);
        var weightedMoves = [];
        // Find a list of likely moves.
        for (var _i = 0, possibleMoves_1 = possibleMoves; _i < possibleMoves_1.length; _i++) {
            var move = possibleMoves_1[_i];
            if (board.board[move.to.row][move.to.column] !== 0) {
                weightedMoves.push([move, 60]);
            }
            else {
                weightedMoves.push([move, 1]);
            }
        }
        // Choose a move.
        if (weightedMoves.length > 0) {
            return MCTSWorker.chooseRandomWeighted(weightedMoves);
        }
        else {
            return null;
        }
    };
    MCTSWorker.chooseRandomMove = function (board) {
        var possibleMoves = this.findPossibleMoves(board);
        if (possibleMoves.length > 0) {
            return MCTSWorker.chooseRandom(possibleMoves);
        }
        else {
            return null;
        }
    };
    MCTSWorker.findPossibleMoves = function (board) {
        var possibleMoves = [];
        for (var row = 0; row < Board.BOARD_SIZE; ++row) {
            for (var column = 0; column < Board.BOARD_SIZE; ++column) {
                var moves = board.findAvailableMoves(new Coordinate(row, column));
                for (var i = 0; i < moves.length; ++i) {
                    possibleMoves.push(new Move(new Coordinate(row, column), moves[i]));
                }
            }
        }
        return possibleMoves;
    };
    MCTSWorker.prototype.playGame = function (state) {
        this.board.setBoardState(state);
        var winner = 0;
        while (winner === 0) {
            var move = MCTSWorker.chooseMove(this.board);
            this.board.makeMove(move);
            winner = this.board.isGameFinished();
        }
        return winner;
    };
    return MCTSWorker;
}());
var Move = /** @class */ (function () {
    function Move(from, to) {
        this.from = from;
        this.to = to;
    }
    return Move;
}());
var Board = /** @class */ (function () {
    function Board() {
        this.selectedCoordinate = undefined;
        this.playerTurn = 1;
    }
    /* findAvailableMoves: function(): Coordinate[] {}
       Parameters location: Coordinate
       Returns: An array of type Coordinate.
       This function checks to see what moves are available at a location. It returns an array of type Coordinate.
       findAvailableMoves():Coordinate[] {
         return this.findAvailableMoves(this.selectedCoordinate);
    }
    */
    Board.prototype.findAvailableMoves = function (location) {
        /* When an empty array is returned that means there are no available moves from the
           location passed into the function.
        */
        if (!this.isLocationValid(location) || this.board[location.row][location.column] === 0) {
            return [];
        }
        var availableMoves = [];
        // Find the next row to move to.
        var row;
        if (this.board[location.row][location.column] === 1) {
            row = location.row + 1;
        }
        else {
            row = location.row - 1;
        }
        // Testing if the diagonals or center moves are valid.
        // During this for loop all available moves are pushed to the availableMoves array.
        for (var count = -1; count <= 1; count++) {
            var column = location.column + count;
            var location2 = new Coordinate(row, column);
            var move = new Move(location, location2);
            if (this.isMoveValid(move)) {
                availableMoves.push(move.to);
            }
        }
        return availableMoves;
    };
    /* getBoardState: function()
       Parameters: none
       This function returns the two dimensional array board. This array is of type number.
    */
    Board.prototype.getBoardState = function () {
        var state = this.playerTurn.toString();
        for (var row = 0; row < Board.BOARD_SIZE; ++row) {
            for (var col = 0; col < Board.BOARD_SIZE; ++col) {
                state += this.board[row][col].toString();
            }
        }
        return state;
    };
    Board.prototype.setBoardState = function (state) {
        this.playerTurn = +state[0];
        this.board = [];
        for (var row = 0; row < Board.BOARD_SIZE; ++row) {
            this.board[row] = [];
            for (var col = 0; col < Board.BOARD_SIZE; ++col) {
                this.board[row][col] = +state[(row * Board.BOARD_SIZE) + col + 1];
            }
        }
    };
    /* isLocationValid: function(){}
     Parameters: location: [number, number]
     The parameter location is a tuple that contains two numbers. These numbers are the x and y
     coordinates for a potential location.
  
     The function checks to see if a move is out of bounds. It returns true if the location
     passed in is in bounds. Otherwise the function returns false.
  */
    Board.prototype.isLocationValid = function (location) {
        return (location && location !== undefined && location.row >= 0 && location.column >= 0 &&
            location.row < Board.BOARD_SIZE && location.column < Board.BOARD_SIZE);
    };
    /* isMoveValid: function(){}
       Parameters: location1: [number, number], location2: [number, number]
       The parameters location1 and location2 are tuples that contains two numbers.
       These numbers are the x and y coordinates for a potential location.
  
       This function checks to see if the piece in location1 is okay to move to location2.
       Returns: A boolean that determines if it is okay to move.
    */
    Board.prototype.isMoveValid = function (move) {
        // Verify that both locations given are valid.
        if (!move || !this.isLocationValid(move.from) || !this.isLocationValid(move.to) || this.isGameFinished() !== 0) {
            return false;
        }
        // Find the piece at the given starting location.
        var piece = this.board[move.from.row][move.from.column];
        var row;
        /* Verify that the starting piece exists and that it's the player's turn.
           If so, find the row we need to be moving to.
        */
        if (piece === 0 || piece !== this.playerTurn) {
            return false;
        }
        else if (piece === 1) {
            row = move.from.row + 1;
        }
        else {
            row = move.from.row - 1;
        }
        // Verify that we are moving to the next row.
        if (move.to.row !== row) {
            return false;
        }
        // Check to see if the move is within range and direction of piece.
        if (Math.abs(move.to.column - move.to.column) > 1) {
            return false;
        }
        // If we are moving forwards, check to see if the space ahead is clear.
        if (move.from.column === move.to.column && this.board[row][move.to.column] !== 0) {
            return false;
        }
        // We are moving diagonally, check to see if the space is clear of our own pieces.
        return (this.board[row][move.to.column] !== piece);
    };
    /* isGameFinished: function(){}
     Checks if the game has finished and returns the winner.
     Returns:
          0: Game has not finished.
          1: Player 1 has won.
          2: Player 2 has won.
    */
    Board.prototype.isGameFinished = function () {
        // Check for a home row victory.
        for (var c = 0; c < Board.BOARD_SIZE; ++c) {
            // Check for player 2 (black) on player 1's home row.
            if (this.board[Board.BOARD_SIZE - 1][c] === 1) {
                return 1;
            }
            // Check for player 1 (white) on player 2's home row.
            if (this.board[0][c] === 2) {
                return 2;
            }
        }
        // Search the board to find if each player has a piece or not.
        var playerOneFound = false;
        var playerTwoFound = false;
        for (var row = 0; row < Board.BOARD_SIZE && (!playerOneFound || !playerTwoFound); ++row) {
            for (var column = 0; column < Board.BOARD_SIZE && (!playerOneFound || !playerTwoFound); ++column) {
                switch (this.board[row][column]) {
                    case 1:
                        playerOneFound = true;
                        break;
                    case 2:
                        playerTwoFound = true;
                        break;
                }
            }
        }
        // Check if one side has run out of pieces.
        if (playerOneFound && playerTwoFound) {
            return 0;
        }
        else if (playerOneFound) {
            return 1;
        }
        else {
            return 2;
        }
    };
    Board.prototype.makeMove = function (move) {
        // let creatorTurn = this.db.collection('games', ref => ref.where('playerTurn', '==', this.playerTurn));
        if (this.isMoveValid(move)) {
            var piece = this.board[move.from.row][move.from.column];
            this.board[move.from.row][move.from.column] = 0;
            this.board[move.to.row][move.to.column] = piece;
            // Change the turn.
            this.playerTurn = (this.playerTurn === 1) ? 2 : 1;
            // Deselect the piece.
            this.selectedCoordinate = undefined;
            // Update the win status.
            // this.winner = this.isGameFinished();
            return true;
        }
        return false;
    };
    /* newGame: function(){}
       Parameters: none
       The newGame function takes no parameters and it returns nothing. It accesses the board property which is
       a two dimensional array of type number. This array is the model for our game board. At the end of this
       function empty spaces on the board will be represented with zeroes. Player 1's pieces will be represented
       with the number one, and Player 2's pieces will be represented with the number two.
  */
    Board.prototype.newGame = function () {
        // Initialize the board
        this.board = [];
        this.boardClass = [];
        // Fill the board array with zeros.
        for (var row = 0; row < Board.BOARD_SIZE; row++) {
            this.board[row] = [];
            this.boardClass[row] = [];
            for (var column = 0; column < Board.BOARD_SIZE; column++) {
                this.boardClass[row][column] = '';
                if (row <= 1) {
                    this.board[row][column] = 1;
                }
                else if (row >= Board.BOARD_SIZE - 2) {
                    this.board[row][column] = 2;
                }
                else {
                    this.board[row][column] = 0;
                }
            }
        }
        this.selectedCoordinate = undefined;
        this.playerTurn = 1;
    };
    /* selectPiece: function(){}
       Parameters: target: Coordinate
       This function checks to see if a spot selected on the board is empty or if it contains a player piece.
       If the space clicked is empty then the this.selectedCoordinate is set to undefined. Else if the selected space
       contains a one or a two, as represented by this.playerTurn, then the selected coordinate is set to target.
       This allows us to determine which of the pieces have been clicked and selected.
    */
    Board.prototype.clearHighlighting = function () {
        for (var row = 0; row < Board.BOARD_SIZE; row++) {
            for (var col = 0; col < Board.BOARD_SIZE; col++) {
                this.boardClass[row][col] = '';
            }
        }
    };
    Board.BOARD_SIZE = 8;
    return Board;
}());
var Coordinate = /** @class */ (function () {
    function Coordinate(row, column) {
        this.row = row;
        this.column = column;
    }
    return Coordinate;
}());
