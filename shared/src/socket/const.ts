export enum WSClientGameEvent {
  Turn = "turn",
  Surrender = "surrender",
  FindGame = "find_game",
}
export enum WSServerGameEvent {
  TurnConfirmed = "turn_confirmed",
  TurnRejected = "turn_rejected",
  OpponentTurn = "opponent_turn",
  SurrenderConfirmed = "surrender_confirmed",
  OpponenSurrender = "opponent_surrender",
  OpponentDisconnected = "opponent_disconnected",
  OpponentWon = "opponent_won",
  YouWon = "you_won",
  GameStarted = "game_starterd",
  WaitingForOpponent = "waiting_for_opponent",
  Stalemate = "stalemate",
}
