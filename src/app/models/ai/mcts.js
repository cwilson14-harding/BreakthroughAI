"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("../board");
var move_1 = require("../move");
var node_1 = require("./node");
var coordinate_1 = require("../game-core/coordinate");
var MCTS = /** @class */ (function () {
    function MCTS() {
        this.canExecute = false;
        this.workers = [];
        var board = new board_1.Board();
        board.newGame();
        this.rootNode = new node_1.Node(board);
        this.currentNode = this.rootNode;
    }
    MCTS.chooseRandom = function (a) {
        if (a.length > 0) {
            var index = Math.floor((Math.random() * a.length));
            return a[index];
        }
        else {
            return null;
        }
    };
    MCTS.chooseRandomMove = function (board) {
        var possibleMoves = [];
        for (var row = 0; row < board_1.Board.BOARD_SIZE; ++row) {
            for (var column = 0; column < board_1.Board.BOARD_SIZE; ++column) {
                var moves = board.findAvailableMoves(new coordinate_1.Coordinate(row, column));
                for (var i = 0; i < moves.length; ++i) {
                    possibleMoves.push(new move_1.Move(new coordinate_1.Coordinate(row, column), moves[i]));
                }
            }
        }
        if (possibleMoves.length > 0) {
            return MCTS.chooseRandom(possibleMoves);
        }
        else {
            return null;
        }
    };
    MCTS.prototype.bestNode = function () {
        var team = this.currentNode.turn;
        var maxNodes = [];
        var maxNodeScore = -1;
        // Find the node with the most evaluations.
        for (var _i = 0, _a = this.currentNode.getAllChildren(); _i < _a.length; _i++) {
            var node = _a[_i];
            // Get the current score for this node.
            var score = node.getWinRatio(team);
            // Check if the score is the highest.
            if (score > maxNodeScore) {
                // New score is higher than previous.
                maxNodes = [node];
                maxNodeScore = score;
            }
            else if (score === maxNodeScore) {
                // New score is equal to previous.
                maxNodes.push(node);
            }
        }
        // Return null if no possible moves.
        if (maxNodes.length === 0) {
            return null;
        }
        // Choose a random node from the top nodes.
        var chosenNode = MCTS.chooseRandom(maxNodes);
        // Return the chosen node.
        return chosenNode;
    };
    MCTS.prototype.updateBoard = function (board) {
        // Create the new board configuration.
        var newBoard = new board_1.Board();
        newBoard.setBoardState(board.getBoardState());
        // Find or create the new node.
        var node = this.currentNode.findChildWithState(newBoard.getBoardState());
        this.currentNode = node;
    };
    MCTS.prototype.startSearch = function () {
        this.canExecute = true;
        if (Worker) {
            this.evaluateMoves(this.currentNode);
            this.workers.push(new Worker('/assets/scripts/worker.js'));
            var node_2 = this.currentNode.getAllChildren()[0];
            this.workers[0].postMessage(node_2.state);
            this.workers[0].onmessage = function (ev) {
                var wins = ev.data.split('-');
                node_2.p1wins += wins[0];
                node_2.p2wins += wins[1];
                console.log(wins);
            };
        }
    };
    MCTS.prototype.stopSearch = function () {
        this.canExecute = false;
        for (var _i = 0, _a = this.workers; _i < _a.length; _i++) {
            var worker = _a[_i];
            worker.terminate();
        }
    };
    MCTS.prototype.getMove = function () {
        var bestNode = this.bestNode();
        // Update the current node to be the best node.
        this.currentNode = bestNode;
        // Remove all previous nodes to save on memory.
        bestNode.parent.children = [bestNode];
        // this.rootNode = this.currentNode;
        // this.rootNode.parent = null;
        return bestNode.move;
    };
    MCTS.prototype.evaluateMoves = function (node) {
        // Get all possible moves.
        var children = node.getAllChildren();
        // If there are no moves to make, don't bother.
        if (children.length === 0) {
            return;
        }
        // Evaluate each possible node a set number of times before focusing on the top ones.
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var chosenNode = children_1[_i];
            for (var i = 0; i < 20; ++i) {
                this.playRandomGame(chosenNode);
            }
        }
        // Play a certain number of games of the top nodes.
        for (var i = 0; i < 4000 && this.canExecute; ++i) {
            var chosenNode = this.chooseNodeToEvaluate(children);
            this.playRandomGame(chosenNode);
        }
    };
    MCTS.prototype.chooseNodeToEvaluate = function (nodes) {
        if (nodes.length === 0) {
            return null;
        }
        var team = nodes[0].parent.turn;
        var maxNode;
        var maxScore = -1;
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            if (maxNode === undefined || node.getWinRatio(team) > maxScore) {
                maxScore = node.getWinRatio(team);
                maxNode = node;
            }
        }
        return maxNode;
    };
    MCTS.prototype.playRandomGame = function (node) {
        var board = new board_1.Board();
        board.setBoardState(node.state);
        var winner = board.isGameFinished();
        // Play the game until a winner is found.
        while (winner === 0) {
            var move = MCTS.chooseRandomMove(board);
            board.makeMove(move);
            winner = board.isGameFinished();
        }
        // Propagate the win back up to the root node.
        while (node !== null) {
            if (winner === 1) {
                ++node.p1wins;
            }
            else {
                ++node.p2wins;
            }
            node = node.parent;
        }
        return winner;
    };
    return MCTS;
}());
exports.MCTS = MCTS;
