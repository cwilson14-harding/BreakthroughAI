import {Board} from '../board';
import {Move} from '../move';
import {Node} from '../../sign-in/node';
import {MCTSWorkerPool} from './mcts-worker-pool';
import {Task} from './task';
import {NeuralNetwork} from './neural-network';
import {MCTS} from './mcts';

export class MCTSProjectZen {

	rootNode: Node;
	currentNode: Node;
	canExecute: Boolean = false;
	workerPool: MCTSWorkerPool = new MCTSWorkerPool();

	private bestNode(): Node {
		const team: number = this.currentNode.turn;
		let maxNodes: Node[] = [];
		let maxNodeScore = -1;

		// Find the node with the most evaluations.
		for (const node of this.currentNode.getAllChildren()) {
			// Get the current score for this node.
			const score = node.getWinRatio(team);

			// Check if the score is the highest.
			if (score > maxNodeScore) {
				maxNodes = [node];

				// New score is higher than previous.
				maxNodeScore = score;

			} else if (score === maxNodeScore) {
				maxNodes.push(node);
			}
		}


		// Choose a random node from the top nodes.
		return MCTS.chooseRandom(maxNodes);
	}

	constructor(public neuralNetwork: NeuralNetwork) {
		const board: Board = new Board();
		board.newGame();
		this.rootNode = new Node(board);
		this.currentNode = this.rootNode;
	}

	updateBoard(board: Board) {
		// Create the new board configuration.
		const state: string = board.getBoardState();
		if (state !== this.currentNode.state) {
			const newBoard: Board = new Board();
			newBoard.setBoardState(state);

			// Find or create the new node.
			this.currentNode = this.currentNode.findChildWithState(state);
		}
	}

	startSearch() {
		this.canExecute = true;
		/*if (Worker) {
			this.evaluateMovesThreaded(this.currentNode);
		} else {*/
			this.evaluateMoves(this.currentNode);
		//}
	}

	stopSearch() {
		this.canExecute = false;
		if (Worker) {
			this.workerPool.clearTasks();
		}
	}

	getMove(): Move {
		const bestNode: Node = this.bestNode();
		if (bestNode) {

			// Update the current node to be the best node.
			this.currentNode = bestNode;

			// Remove all previous nodes to save on memory.
			bestNode.parent.children = [bestNode];
			// this.rootNode = this.currentNode;
			// this.rootNode.parent = null;

			return bestNode.move;
		} else {
			return null;
		}
	}

	private taskCompleted(ev: MessageEvent, task: Task) {
		const results = ev.data.split('-');
		let node: Node = task.node;
		while (node) {
			node.p1wins += +results[0];
			node.p2wins += +results[1];
			node = node.parent;
		}
	}

	private evaluateMovesThreaded(node: Node) {
		// Get all the possible moves.
		const children: Node[] = node.getAllChildren();

		// Evaluate all of the nodes.
		for (const chosenNode of children) {
			const task: Task = new Task(chosenNode, 300, this.taskCompleted);
			this.workerPool.addTask(task);
		}

		// Concentrate on the best nodes.
		this.workerPool.onAllTasksCompleted(() => {
			const sortedNodes: Node[] = this.sortNodesByBest(children, node.turn);
			for (let i = 0; i < MCTSWorkerPool.THREAD_COUNT && i < children.length; ++i) {
				this.workerPool.addTask(new Task(sortedNodes[i], 500, this.taskCompleted));
			}
		});

	}

	private createTaskToEvaluate(nodes: Node[], ms: number): Task {
		return new Task(this.chooseNodeToEvaluate(nodes), ms, (ev: MessageEvent, task: Task) => {
			this.taskCompleted(ev, task);
			this.workerPool.addTask(this.createTaskToEvaluate(nodes, ms));
		});
	}

	private evaluateMoves(node: Node) {
		// Get all possible moves.
		const children: Node[] = node.getAllChildren();

		// If there are no moves to make, don't bother.
		if (children.length === 0) {
			return;
		}

		// Evaluate each possible node a set number of times before focusing on the top ones.
		for (const chosenNode of children) {
			this.playGame(chosenNode);
		}

		// Play a certain number of games of the top nodes.
		/*for (let i = 0; i < 40 && this.canExecute; ++i) {
			const chosenNode: Node = this.chooseNodeToEvaluate(children);
			this.playGame(chosenNode);
		}*/
	}

	private sortNodesByBest(nodes: Node[], team: number): Node[] {
		return nodes.sort(function (n1: Node, n2: Node) {
			const n1Ratio = n1.getWinRatio(team);
			const n2Ratio = n2.getWinRatio(team);
			if (n1Ratio > n2Ratio) {
				return -1;
			} else if (n1Ratio < n2Ratio) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	private chooseNodeToEvaluate(nodes: Node[]): Node {
		if (nodes.length === 0) {
			return null;
		}

		const team: number = nodes[0].parent.turn;
		let maxNode: Node;
		let maxScore = -1;
		for (const node of nodes) {
			if (maxNode === undefined || node.getWinRatio(team) > maxScore) {
				maxScore = node.getWinRatio(team);
				maxNode = node;
			}
		}
		return maxNode;
	}

	private playGame(node: Node): number {
		const board: Board = new Board();
		board.setBoardState(node.state);
		let winner = board.isGameFinished();

		// Play the game until a winner is found.
		while (winner === 0) {
			const move: Move = this.neuralNetwork.getMove(board.getAIBoardState());
			board.makeMove(move);
			winner = board.isGameFinished();
		}

		// Propagate the win back up to the root node.
		while (node !== null) {
			if (winner === 1) {
				++node.p1wins;
			} else {
				++node.p2wins;
			}
			node = node.parent;
		}

		return winner;
	}
}
