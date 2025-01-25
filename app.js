import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { Chess } from "chess.js";
// import { title } from "process";

const app = express();
const server = createServer(app);
const port = 3000;

const io = new Server(server);

const chess = new Chess(); 
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req,res) => {
  res.render("index", {title : "The King's Game"});
})

io.on("connection", (uniqueSocket)=>{
  console.log("connected");
  
  if(!players.white){
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  }
  else if(!players.black){
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  }
  else{
    uniqueSocket.emit("spactatorRole");
  }

  uniqueSocket.on("move", (move) => {
    try{
      // checking if valid player is making the move.
      if(chess.turn == 'w' && socket.id !== players.white) return;
      if(chess.turn == 'b' && socket.id !== players.black) return;

      //checking the valid move.
      const result = chess.move(move);
      if(result){
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } 
      else{
        console.log("Invalid move : ", move);
        uniqueSocket.emit("Invalid move : ", move); 
      }

    }
    catch(err){
      console.log(err);
      uniqueSocket.emit("Invalid move : ", move);
    }
  });

  uniqueSocket.on("disconnect", ()=>{
    if(uniqueSocket.id == players.white ){
      delete players.white;
    }
    else if(uniqueSocket.id == players.black){
      delete players.black;
    }
    else{
      console.log("Spactator Disconnected");
    }
  });

});


server.listen({port}, ()=>{
  console.log(`Listing on the port number ${port}`);
})