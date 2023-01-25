// NormalChess.js (https://github.com/NormalChess/NormalChess-Repo)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);



function move(divId, amt, t) {
    var elements = document.getElementById(divId).children;
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.transition = "transform " + t.toString() + "s ease-in-out";
      elements[i].style.transform = "translateY(" + amt.toString() + "%)";
    }
  }

move("lobbies", 100, 0.01);
move("lobby", 100, 0.01);
move("game", 100, 0.01);

var form = document.getElementById('form');
var form2 = document.getElementById('lobbyForm');


// Store username
var username = "";

// Store current gameId
var gameId = "";

if (urlParams.get('challenge') != null)
  gameId = urlParams.get('challenge');

// Store the current board
var board = null;

// Create a socket.io object
var socket = io();

form.addEventListener('submit', function(e) {
  let textbox = document.getElementById("textbox");
  e.preventDefault();
  socket.emit('name', {name: textbox.value, id: gameId});
  textbox.value = '';
});

let tbox1 = document.getElementsByClassName("lobbyText")[0];
let check = document.getElementsByClassName("checkLobby")[0];
tbox1.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    if (tbox1.value) {
        socket.emit('create', {name: tbox1.value, isPrivate: check.checked});
        tbox1.value = '';
      }
  }
});

let tbox2 = document.getElementsByClassName("codeText")[0];
tbox2.addEventListener("keypress", function(event) {
  
    if (event.key === "Enter") {
      if (tbox2.value) {
          socket.emit('join', tbox2.value);
          tbox2.value = '';
        }
    }
  });

socket.on("error", function(v) {
  console.warn("[Normal Chess] " + v);
});

socket.on("lobbies", function(v) {
    var lobbies = v["list"];
    username = v["username"];

    let n = document.querySelector("#name");
    n.innerHTML = "You are playing as: <b style='color: lightblue'>" + username + "</b>";

    move("nickname", 120, 1);
    move("lobby", 120, 1);
    move("game", 120, 1);
    move("lobbies", 0, 1);
    
    var lobs = document.querySelector("#lobs");
    lobs.innerHTML = "";

    if (lobbies.length == 0)
    {
        lobs.innerHTML = "<h3>No lobbies found!<p>\nWhy don't you make one?</p></h3>";
    }
    else
    {
        lobbies.forEach(l => {
            lobs.innerHTML += "<h3><p><b>" + l.gameName + "</b></p><p>Players: " + l.playerCount.toString() + "/2 </p><button id='" + l.gameId + "join'>Join</button></h3>";
            let b = document.getElementById(l.gameId + "join");
            b.addEventListener("click", function() {
                socket.emit("join", l.gameId);
            });
        });
    }
    
});

socket.on("lobby", function(v) {
    var game = v["lobby"];
    gameId = game.gameId;
    move("nickname", 120, 1);
    move("lobbies", 120, 1);
    move("game", 120, 1);
    move("lobby", 0, 1);

    var lobs = document.querySelector("#lobs");
    lobs.innerHTML = "";

    let ln = document.getElementById("lobbyName");
    ln.innerHTML = game.gameName + " <p>" + game.link + "</p>\n<p>Players: " + game.playerCount.toString() + "/2</p>";
    let list = document.getElementById("players");
    list.innerHTML = "";
    game.players.forEach(p => {
        list.innerHTML += "<h3>" + p + "</h3>";
    });

    if (game.isHost)
    {
        list.innerHTML += "<button id='startButton'>Start</button>";
        let bb = document.getElementById("startButton");
        bb.addEventListener("click", function() {
            socket.emit("startButton", game.gameId);
        });
    }
    list.innerHTML += "<button id='leaveButton'>Leave</button>";
    let b = document.getElementById("leaveButton");
    b.addEventListener("click", function() {
        list.innerHTML = "";
        socket.emit("leave", game.gameId);
    });
});

socket.on("start", function(v) {
  // Create chess and stuff
  board = v["board"];
  move("lobbies", 120, 1);
  move("game", 0, 1);
  move("lobby", 120, 1);

});
let b = document.getElementById("resign");
b.addEventListener("click", function() {
  list.innerHTML = "";
  socket.emit("resign", game.gameId);
});