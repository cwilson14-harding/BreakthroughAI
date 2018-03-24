var mcts;
onmessage = function (ev) {
    mcts = new MCTSWorkerScoring();
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
var MCTSWorkerScoring = /** @class */ (function () {
    function MCTSWorkerScoring() {
        this.board = new AIBoard();
    }
    MCTSWorkerScoring.chooseRandom = function (a) {
        if (a.length > 0) {
            var index = Math.floor((Math.random() * a.length));
            return a[index];
        }
        else {
            return null;
        }
    };
    MCTSWorkerScoring.chooseMove = function (board) {
        var possibleMoves = this.findPossibleMoves(board);
        // Return null if no moves were found.
        if (possibleMoves.length === 0) {
            return null;
        }
        // Check if any move is a capturing move.
        var capturingMoves = MCTSWorkerScoring.findCapturingMoves(board, possibleMoves);
        if (capturingMoves.length === 0) {
            // No capturing moves, choose a random one.
            //return MCTSWorkerScoring.chooseRandom(possibleMoves);
        }
        // Score all the moves and take the highest score.
        var state = board.getAIBoardState();
        var turn = board.turn;
        var bestScore = -1;
        var bestMove = null;
        for (var _i = 0, possibleMoves_1 = possibleMoves; _i < possibleMoves_1.length; _i++) {
            var move = possibleMoves_1[_i];
            board.makeMove(move);
            var score = board.scoreBoardState(turn);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            board.setAIBoardState(state);
        }
        return bestMove;
    };
    MCTSWorkerScoring.findCapturingMoves = function (board, possibleMoves) {
        var results = [];
        for (var _i = 0, possibleMoves_2 = possibleMoves; _i < possibleMoves_2.length; _i++) {
            var move = possibleMoves_2[_i];
            if (board.board[move.to.index] !== 0) {
                results.push(move);
            }
        }
        return results;
    };
    MCTSWorkerScoring.findPossibleMoves = function (board) {
        var possibleMoves = [];
        for (var j = 0; j < 64; ++j) {
            var from = Coordinate.fromIndex(j);
            var moves = board.findAvailableMoves(from);
            for (var i = 0; i < moves.length; ++i) {
                possibleMoves.push(new Move(from, moves[i]));
            }
        }
        return possibleMoves;
    };
    MCTSWorkerScoring.prototype.playGame = function (state) {
        this.board.setGUIBoardState(state);
        var winner = 0;
        while (winner === 0) {
            var move = MCTSWorkerScoring.chooseMove(this.board);
            this.board.makeMove(move);
            winner = this.board.isGameOver();
        }
        return winner;
    };
    return MCTSWorkerScoring;
}());
var AIBoard = /** @class */ (function () {
    function AIBoard() {
    }
    AIBoard.prototype.newGame = function () {
        this.turn = -1;
        this.board = [];
        this.board.length = 64;
        for (var i = 0; i < 64; ++i) {
            if (i < 16) {
                this.board[i] = -1;
            }
            else if (i > 48) {
                this.board[i] = 1;
            }
            else {
                this.board[i] = 0;
            }
        }
    };
    AIBoard.prototype.findAvailableMoves = function (location) {
        if (this.board[location.index] !== this.turn) {
            return [];
        }
        var availableMoves = [];
        // Find the next row to move to.
        var row;
        if (this.board[location.index] === -1) {
            row = location.row + 1;
        }
        else {
            row = location.row - 1;
        }
        for (var count = -1; count <= 1; count++) {
            var column = location.column + count;
            var location2 = new Coordinate(row, column);
            var move = new Move(location, location2);
            if (this.isValidMove(move)) {
                availableMoves.push(move.to);
            }
        }
        return availableMoves;
    };
    AIBoard.prototype.makeMove = function (move) {
        if (!this.isValidMove(move)) {
            return false;
        }
        this.board[move.toIndex] = this.board[move.fromIndex];
        this.board[move.fromIndex] = 0;
        this.turn *= -1;
        return true;
    };
    AIBoard.prototype.isGameOver = function () {
        // Check if player 2 is in the home row.
        for (var i = 0; i < 8; ++i) {
            if (this.board[i] === 1) {
                return 1;
            }
        }
        // Check if player 1 is in the home row.
        for (var i = 63; i >= 56; --i) {
            if (this.board[i] === -1) {
                return -1;
            }
        }
        // Search for pieces left.
        var foundP1 = false;
        var foundP2 = false;
        for (var i = 0; i < 64 && (!foundP1 || !foundP2); ++i) {
            if (this.board[i] === -1) {
                foundP1 = true;
            }
            else if (this.board[i] === 1) {
                foundP2 = true;
            }
        }
        // Return if a team did not have any pieces left.
        if (foundP1 && !foundP2) {
            return -1;
        }
        else if (!foundP1 && foundP2) {
            return 1;
        }
        else {
            return 0;
        }
    };
    AIBoard.prototype.isValidMove = function (move) {
        if (!move) {
            return false;
        }
        var fromIndex = move.fromIndex;
        var toIndex = move.toIndex;
        if (this.isGameOver() !== 0) {
            return false;
        }
        // Verify array boundaries.
        if (toIndex >= 64 || toIndex < 0 || fromIndex >= 64 || fromIndex < 0) {
            return false;
        }
        // Verify that we are moving the correct team's piece.
        if (this.board[fromIndex] !== this.turn) {
            return false;
        }
        var row = fromIndex + (8 * this.turn * -1);
        // Verify that the row we are moving to is the next row.
        if (Math.floor(toIndex / 8) !== Math.floor(row / 8)) {
            return false;
        }
        // Verify frontal moves are not blocked.
        if (toIndex === fromIndex + 8 * this.turn * -1) {
            return this.board[toIndex] === 0;
        }
        // Verify that diagonal moves are at the correct locations and are not blocked by a friendly piece.
        return (toIndex === row + 1 || toIndex === row - 1) && this.board[toIndex] !== this.turn;
    };
    AIBoard.prototype.getAIBoardState = function () {
        return [this.turn].concat(this.board);
    };
    AIBoard.prototype.getNormalizedState = function (team) {
        // Returns the state from the given perspective, which normalizes it.
        var result = [];
        if (team === -1) {
            for (var i = 0; i < this.board.length; ++i) {
                if (this.board[i] === -1) {
                    result.push(1);
                }
                else if (this.board[i] === 1) {
                    result.push(2);
                }
                else {
                    result.push(0);
                }
            }
        }
        else {
            for (var i = this.board.length - 1; i >= 0; --i) {
                if (this.board[i] === -1) {
                    result.push(2);
                }
                else if (this.board[i] === 1) {
                    result.push(1);
                }
                else {
                    result.push(0);
                }
            }
        }
        return result;
    };
    AIBoard.prototype.setGUIBoardState = function (state) {
        this.turn = (state[0] === '1') ? -1 : 1;
        this.board = [];
        this.board.length = 64;
        for (var i = 1; i < state.length; ++i) {
            if (+state[i] === 1) {
                this.board[i - 1] = -1;
            }
            else if (+state[i] === 2) {
                this.board[i - 1] = 1;
            }
            else {
                this.board[i - 1] = 0;
            }
        }
    };
    AIBoard.prototype.setAIBoardState = function (state) {
        this.turn = state[0];
        this.board = state.slice(1);
    };
    AIBoard.prototype.scoreBoardState = function (fromPlayer) {
        if (fromPlayer === void 0) { fromPlayer = this.turn; }
        // Count the material.
        var pieceMap = [
            5, 15, 15, 5, 5, 15, 15, 5,
            2, 3, 3, 3, 3, 3, 3, 2,
            4, 6, 6, 6, 6, 6, 6, 4,
            7, 10, 10, 10, 10, 10, 10, 7,
            11, 15, 15, 15, 15, 15, 15, 11,
            16, 21, 21, 21, 21, 21, 21, 16,
            20, 28, 28, 28, 28, 28, 28, 20,
            36, 36, 36, 36, 36, 36, 36, 36
        ];
        var board = this.getNormalizedState(fromPlayer);
        var score = 0;
        var myPieces = [];
        var enemyPieces = [];
        for (var c = 0; c < 64; ++c) {
            if (board[c] === 1) {
                myPieces.push(c);
                score += pieceMap[c];
                // Check reinforcement/threats
                var target = Coordinate.fromIndex(c);
                var stability = 0;
                // Check reinforcing.
                for (var _i = 0, _a = [c - 8 - 1, c - 8 + 1]; _i < _a.length; _i++) {
                    var index = _a[_i];
                    var other = Coordinate.fromIndex(index);
                    if (other.row === target.row - 1 && Math.abs(other.column - target.column) === 1 && other.row >= 0 && board[other.index] === 1) {
                        stability++;
                    }
                }
                // Check threatening.
                for (var _b = 0, _c = [c + 8 - 1, c + 8 + 1]; _b < _c.length; _b++) {
                    var index = _c[_b];
                    var other = Coordinate.fromIndex(index);
                    if (other.row === target.row + 1 && Math.abs(other.column - target.column) === 1 && other.row < 8 && board[other.index] === 1) {
                        stability--;
                    }
                }
                score += stability * 10;
            }
            else if (board[c] === 2) {
                enemyPieces.push(c);
            }
        }
        score += (myPieces.length - enemyPieces.length) * 10;
        // Return the score.
        return score;
    };
    return AIBoard;
}());
var Coordinate = /** @class */ (function () {
    function Coordinate(row, column) {
        this.row = row;
        this.column = column;
    }
    Object.defineProperty(Coordinate.prototype, "index", {
        get: function () {
            return this.row * 8 + this.column;
        },
        enumerable: true,
        configurable: true
    });
    Coordinate.fromIndex = function (index) {
        return new Coordinate(Math.floor(index / 8), index % 8);
    };
    return Coordinate;
}());
var Move = /** @class */ (function () {
    function Move(from, to) {
        this.from = from;
        this.to = to;
    }
    Object.defineProperty(Move.prototype, "toIndex", {
        get: function () {
            return this.to.row * 8 + this.to.column;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Move.prototype, "fromIndex", {
        get: function () {
            return this.from.row * 8 + this.from.column;
        },
        enumerable: true,
        configurable: true
    });
    Move.prototype.equals = function (move) {
        return this.from.row === move.from.row &&
            this.from.column === move.from.column &&
            this.to.row === move.to.row &&
            this.to.column === move.to.column;
    };
    return Move;
}());
