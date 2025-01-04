import { Server } from "socket.io";
import { Matchmaker } from "./matchmaker";
import { Player } from "../shared/src/chess/game";
import { GameMachine } from "./game-machine";
import {
  WSClientGameEvent,
  WSServerGameEvent,
} from "../shared/src/socket/const";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  // key: readFileSync("/path/to/my/key.pem"),
  // cert: readFileSync("/path/to/my/cert.pem")
});

const matchmaker = new Matchmaker();

const gameMachines: GameMachine[] = []; // better structure is needed
io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.on(WSClientGameEvent.FindGame, (data) => {
    console.log("on find game event");
    const player = new Player(data.name);
    const match = matchmaker.findMatch(player, socket);
    if (match) {
      const onMatchEnd = () => {
        gameMachines.splice(gameMachines.indexOf(gameMachine), 1);
      };
      const { game, opponentSocket } = match;
      const gameMachine = new GameMachine(
        game,
        socket,
        opponentSocket,
        onMatchEnd
      );
      gameMachines.push(gameMachine);
      gameMachine.beginGame();
    } else {
      socket.emit(WSServerGameEvent.WaitingForOpponent);
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (matchmaker.isSocketIdInQueue(socket.id)) {
      console.log("removing from queue");
      matchmaker.removeSocketFromQueue(socket.id);
    } else {
      const gameMachine = gameMachines.find((gameMachine) => {
        return gameMachine.isSocketIdInGame(socket.id);
      });
      if (gameMachine) {
        console.log("Finish game");
        gameMachine.handlePlayerDisconnect(socket.id);
        gameMachines.splice(gameMachines.indexOf(gameMachine), 1);
      }
    }
  });
});

io.listen(4000);
console.log("Listening 4000");
