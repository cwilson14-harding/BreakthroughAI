export enum PlayerType {
  Local, // Player on the local machine.
  AI, // Computer player.
  Network // Player on a foreign machine.
}

export class PlayerData {
  constructor (public name: string, public imageUrl: string, public type: PlayerType) {}
}
