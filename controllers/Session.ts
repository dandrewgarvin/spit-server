import { GameInput, Game } from "../types";

import GameManager from "./Game";

export default class SessionManager {
  public sessions: Game[];

  constructor() {
    this.sessions = [];
  }

  addGame(game_input: GameInput): Game {
    const game = new GameManager(game_input);

    this.sessions.push(game);

    return game;
  }

  removeGame(id: String): Game {
    const game = this.sessions.find((game) => game.id === id);

    this.sessions = this.sessions.filter((game) => game.id !== id);

    return game;
  }

  listGames(cursor: number, count: number): Game[] {
    return this.sessions.slice(cursor, count);
  }

  findGame(id: String): Game {
    const game = this.sessions.find((game) => game.id === id);

    if (!game) {
      throw {
        statusCode: 400,
        msg: "Invalid Game Id",
      };
    }

    return game;
  }
}
