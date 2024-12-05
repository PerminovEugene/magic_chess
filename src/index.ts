import { Server } from "socket.io";
import { Matchmaker } from "./matchmaker";
import { Player } from "./chess/game";
import { GameMachine } from "./chess/game-machine";

const io = new Server({
  // key: readFileSync("/path/to/my/key.pem"),
  // cert: readFileSync("/path/to/my/cert.pem")
});

const matchmaker = new Matchmaker();

const gameMachines: GameMachine[] = [];
io.on("connection", (socket) => {
  // ...
  socket.send("Connected");
  // send info about rooms/games

  socket.on("find-game", (data) => {
    const player = new Player(socket, data.name);
    const game = matchmaker.findMatch(player);
    if (game) {
      const gameMachine = new GameMachine(game);
      gameMachines.push(gameMachine);
    } else {
      socket.send("waiting-for-opponent");
    }
  });
});

io.listen(3000);
