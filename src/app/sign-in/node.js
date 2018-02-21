"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("../models/board");
var move_1 = require("../models/move");
var coordinate_1 = require("../models/game-core/coordinate");
var Node = /** @class */ (function () {
    function Node(board, move, parent) {
        if (move === void 0) { move = null; }
        if (parent === void 0) { parent = null; }
        this.move = move;
        this.parent = parent;
        this.children = [];
        this.p1wins = 0;
        this.p2wins = 0;
        this.childrenEvaluated = false;
        this.state = board.getBoardState();
    }
    Object.defineProperty(Node.prototype, "turn", {
        get: function () {
            return +this.state[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "evaluationCount", {
        get: function () {
            return this.p1wins + this.p2wins;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.getWinRatio = function (team) {
        return ((team === 1) ? (this.p1wins) : (this.p2wins)) / (this.p1wins + this.p2wins);
    };
    // Return all nodes for all the possible moves with this board state.
    Node.prototype.getAllChildren = function () {
        // Skip evaluation if we have already gotten all children.
        if (!this.childrenEvaluated) {
            // Create all the children.
            var board = new board_1.Board();
            board.setBoardState(this.state);
            for (var _i = 0, _a = this.findAllAvailableMoves(board); _i < _a.length; _i++) {
                var move = _a[_i];
                // Create the new board configuration.
                var newBoard = new board_1.Board();
                newBoard.setBoardState(board.getBoardState());
                // Create new nodes for all the moves.
                newBoard.makeMove(move);
                this.children.push(new Node(newBoard, move, this));
            }
            this.childrenEvaluated = true;
        }
        return this.children;
    };
    Node.prototype.findChildWithState = function (state) {
        for (var _i = 0, _a = this.getAllChildren(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.state === state) {
                return node;
            }
        }
        return null;
    };
    Node.prototype.findAllAvailableMoves = function (board) {
        var possibleMoves = [];
        for (var row = 0; row < board_1.Board.BOARD_SIZE; ++row) {
            for (var column = 0; column < board_1.Board.BOARD_SIZE; ++column) {
                var startCoordinate = new coordinate_1.Coordinate(row, column);
                var moves = board.findAvailableMoves(startCoordinate);
                for (var i = 0; i < moves.length; ++i) {
                    possibleMoves.push(new move_1.Move(startCoordinate, moves[i]));
                }
            }
        }
        return possibleMoves;
    };
    return Node;
}());
exports.Node = Node;
