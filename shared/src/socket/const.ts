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
  OpponentSurrender = "opponent_surrender",
  OpponentDisconnected = "opponent_disconnected",
  OpponentWon = "opponent_won",
  OpponentTimeOut = "opponent_time_out",
  YourTimeOut = "your_time_out",
  YouWon = "you_won",
  GameStarted = "game_starterd",
  WaitingForOpponent = "waiting_for_opponent",
  Stalemate = "stalemate",
}
