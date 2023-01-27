const express = require('express');
var bodyParser = require('body-parser')
var app = express()
var simpleFetch = require('simple-fetch')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const nc = require("./node/normalChess")
const chess = require("./Chess")

// Helper Functions

const generateRandomString = (myLength) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

function remove(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


var players = [];

var lobbies = [];

const getPlayer = (ip) => {
  var rp = null;
  players.every(p => {
    if (p.ip == ip)
    {
      rp = p;
      return false;
    }
    return true;
  });
  return rp;
}


const getLobby = (id) => {
  var rp = null;
  lobbies.every(p => {
    if (p.gameId == id)
    {
      rp = p;
      return false;
    }
    return true;
  });
  return rp;
}

const showLobbies = (socket, p) => {
  var shown = [];
  lobbies.forEach(g => {
    if (!g.isPrivate)
      shown.push({gameName: g.gameName, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames});
  });
  socket.emit('lobbies', {list: shown, username: p.username});
}

app.post('/', (request, response) => {
  console.log(JSON.stringify(request.path))
})

challengeIp = [];

app.use((req, res, next) => {
  switch(req.path)
  {
    case "/" || "/index.html":
      res.sendFile(__dirname + "/NormalChess/index.html");
      break;
    case "/style.css":
      res.sendFile(__dirname + "/NormalChess/style.css");
      break;
    case "/nc.js":
      res.sendFile(__dirname + "/NormalChess/nc.js");
      break;
    case "/favicon.ico":
      res.sendFile(__dirname + "/favicon.ico");
      break;
    case "/chess.js":
      res.sendFile(__dirname + "/Chess.js");
      break;
    case "/art/bg":
      res.sendFile(__dirname + "/art/ncBg.png");
      break;
    default:
      res.status(404).send("<html><head><title>Normal Chess</title></head><body><h1>404</h1><h2>I cannot find that file</h2><p>Go back... <a href='./index.html'>maybe</a>?</p></body></html>");
      break;
  }
})

function start(g, p)
{
  console.log("Starting " + g.gameId + " with " + p.username + " vs " + g.op);

  g.board = new chess.Board();

  var lo = {gameName: g.gameName, link: "http://normalchess.com/?challenge=" + g.gameId, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames};

  
  var white = getRandomInt(2);
  g.players[white].isWhite = true;
  var i = 0;
    g.players.forEach(pp => {
      if (i == 0)
        lo.op = lo.players[1];
      else
        lo.op = lo.players[0];
      pp.socket.emit("start", {board: g.board, lobby: lo});
      i++;
    });
}

io.on('connection', (socket) => {
    var p = new nc.Player(socket.conn.remoteAddress);
    p.socket = socket;
    players.push(p);
    p.username = "Guest_" + nc.generateRandomString(8);
    console.log('User connected from ' + p.ip + ' giving name ' + p.username);
    socket.emit("nick", {});
    socket.on('disconnect', () => {
      console.log(p.username + ' disconnected.');
      lobbies.every(v => {
        var shouldDelete = false;
        v.players.every(pp => {
            if (p.ip == v.host.ip && v.host.username == p.username)
            {
                console.log('Removing ' + v.gameName + " due to " + p.username + " being the host.");
                shouldDelete = true;
                return false;
            }
            else if (pp.ip == p.ip && pp.username == p.username)
            {
              console.log('Removing ' + p.username + " from " + v.gameName);
              remove(v.players, pp);
              v.op = "";
              v.playerNames = [];
              v.players.forEach(c => {
                v.playerNames.push(c.username);
              });
              v.playerCount--;
              v.players.forEach(pp => {
                pp.socket.emit('lobby', {lobby: {isHost: pp.ip == v.host.ip && v.host.username == p.username, gameName: v.gameName, link: "http://normalchess.com/?challenge=" + v.gameId, gameId: v.gameId, playerCount: v.playerCount, players: v.playerNames}});
              });
            }
            return true;
        });
        if (shouldDelete)
        {
            remove(lobbies, v);
            v.players.forEach(pp => {
              pp.inLobby = false;
              showLobbies(pp.socket, pp);
            });
            return false;
        }
        return true;
      });
    });

    socket.on('name', (v) => {
        var n = v.name;
        if (n.length > 16)
          n = n.substring(0,16);
        p.username = n.replace(/<[^>]*>?/gm, '');
        console.log(p.username + ' is now playing!');

        if (v.id.length == 0)
          showLobbies(socket, p);
        else
        {
          var id = v.id;
          var g = getLobby(id);
          if (g == null)
          {
            showLobbies(socket, p);
            return;
          }
          p.isWhite = false;
          p.inLobby = true;
          g.playerCount++;
          var lo = {gameName: g.gameName, link: "http://normalchess.com/?challenge=" + g.gameId, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames};
          
          g.players.push(p);
          g.playerNames.push(p.username);

          g.players.forEach(pp => {
            lo.isHost = pp.ip == g.host.ip && g.host.username == pp.username
            pp.socket.emit("lobby", {lobby: lo});
          });
        }
    });

    
    socket.on('join', (v) => {
        if (p.inLobby)
          return;
        var g = getLobby(v);
        if (g == null)
          return;

        p.isWhite = false;
        p.inLobby = true;
        g.op = p.username;
        g.playerCount++;
        var lo = {gameName: g.gameName, link: "http://normalchess.com/?challenge=" + g.gameId, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames};
        
        g.players.push(p);
        g.playerNames.push(p.username);

        g.players.forEach(pp => {
          lo.isHost = pp.ip == g.host.ip && g.host.username == pp.username
          pp.socket.emit("lobby", {lobby: lo});
        });
    });

    socket.on('start', (v) => {
      if (!p.inLobby)
      {
        p.socket.emit("error", "you are not in a lobby");
        return;
      }
      var g = getLobby(v);
      if (g == null)
      {
        p.socket.emit("error", "that game was not found");
        return;
      }
      if (g.host.ip != p.ip || g.host.username != p.username)
      {
        p.socket.emit("error", "you are not the host");
        return;
      }
      if (g.playerCount < 2)
      {
        p.socket.emit("error", "not enough players");
        return;
      }
      start(g, p)
    });

    socket.on('leave', (v) => {
      if (!p.inLobby)
        return;
      var g = getLobby(v);
      if (g == null)
        return;

      g.playerCount--;
      g.op = "";
      remove(g.players, p);
      remove(g.playerNames, p.username);
      var lo = {gameName: g.gameName, link: "http://normalchess.com/?challenge=" + g.gameId, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames};
      
      console.log(p.username + " left " + g.gameName + ". Players left: " + g.players.length.toString());
      p.inLobby = false;
      if (g.players.length != 0)
      {
        if (p.ip == g.host.ip && g.host.username == p.username)
          g.host = g.players[0];
        g.players.forEach(pp => {
            lo.isHost = pp.ip == g.host.ip && g.host.username == pp.username
            pp.socket.emit("lobby", {lobby: lo});
        });
      }
      else
      {
        remove(lobbies, g);
      }
      showLobbies(p.socket, p);
  });


    socket.on('create', (v) => {
        if (p.inLobby)
          return;
        var name = v["name"].replace(/<[^>]*>?/gm, '');

        p.isWhite = false;
        p.inLobby = true;
        var g = new nc.Lobby(name);
        g.host = p;
        g.playerCount = 1;
        g.isPrivate = v["isPrivate"];
        g.playerNames.push(p.username);
        g.players.push(p);

        console.log("Created " + g.gameName + " by " + p.username + ". Private: " + g.isPrivate);

        lobbies.push(g);
        socket.emit('lobby', {lobby: {isHost: true, link: "http://normalchess.com/?challenge=" + g.gameId, gameName: g.gameName, gameId: g.gameId, playerCount: g.playerCount, players: g.playerNames}});
    });
});

server.listen(80, () => {
  console.log('listening on *:80');
});