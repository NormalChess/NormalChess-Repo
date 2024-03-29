// NormalChess.js (https://github.com/NormalChess/NormalChess-Repo)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function createNotification(message) {
  // Check if there's already a notification present
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    if (message != existingNotification.textContent)
      setTimeout(() => {
        createNotification(message);
      }, 5500);
    return;
  }

  // Create the notification container
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.style.backgroundColor = '#333';
  notification.style.color = '#fff';
  notification.style.padding = '10px';
  notification.style.position = 'fixed';
  notification.style.top = '-50px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.zIndex = '999';
  notification.style.transition = 'top 0.5s ease-in-out';

  // Add the message to the notification
  notification.textContent = message;

  // Append the notification to the body
  document.body.appendChild(notification);

  // Show the notification
  setTimeout(() => {
    notification.style.top = '20px';
  }, 50);

  // Hide the notification after 5 seconds
  setTimeout(() => {
    notification.style.top = '-50px';
  }, 5000);

  // Remove the notification from the DOM after the animation is complete
  setTimeout(() => {
    notification.remove();
  }, 5500);
}

// resign and draw button
var resign = document.getElementById("resign");
var draw = document.getElementById("draw");

resign.disabled = true;
draw.disabled = true;

// leave button
var leave = document.getElementById("leave");
leave.style.opacity = 0;

// Store color
var myColor = 0;

// Store selected tile
var tile = "";

// Store board state
var state = [];

// Store username
var username = "";

// Store current gameId
var gameId = "";

// Store the current board
var board = null;

// Create a socket.io object
var socket = io();

// Selection squares
var selectionSquares = []

function getPieceAt(board, pos, color = -1)
{
    var p = null;
    for(var i = 0; i < board.pieces.length; i++)
    {
      var fp = board.pieces[i];
      if (fp.pos[0] == pos[0] && fp.pos[1] == pos[1] && (fp.color == color || color == -1))
      {
        p = fp;
        break;
      }
    }
    return p;
}

var movePos = [];

function checkPiece(board, cords, color)
    {
        return getPieceAt(board, cords, color) != null;
    }



function getAvaliableMoves(b, p)
    {
        var m = [];
        var opColor = myColor == 0 ? 1 : 0;
        switch(p.type)
        {
            case 1: // pawn
                if (p.moveLifetime == 0)
                {
                    if (p.color == 0)
                    {
                        m.push([p.pos[0],p.pos[1] + 1, false]);
                        m.push([p.pos[0],p.pos[1] + 2, false]);
                    }
                    else
                    {
                        m.push([p.pos[0],p.pos[1] - 1, false]);
                        m.push([p.pos[0],p.pos[1] - 2, false]);
                    }
                }
                else
                {
                    if (p.color == 0)
                        m.push([p.pos[0],p.pos[1] + 1, false]);
                    else
                        m.push([p.pos[0],p.pos[1] - 1, false]);
                }
                if (p.color == 0)
                {
  
                    for (var i = 0; i < 8; i++) {
                      var incd = 1 + (i + 1);
                      var inc = i + 1;
                      var c = [p.pos[0] - (incd), p.pos[1] + (incd), true, true];
                      var c2 = [p.pos[0] + (incd), p.pos[1] + (incd), true, true];

                      if (checkPiece(b,[p.pos[0] - (inc), p.pos[1] + (inc)], opColor))
                          if (!checkPiece(b,c))
                            m.push(c);
                      if (checkPiece(b,[p.pos[0] + (inc), p.pos[1] + (inc)], opColor))
                          if (!checkPiece(b,c2))
                            m.push(c2);
                    }

                    var op = getPieceAt(b, [p.pos[0] - 1, p.pos[1]], opColor);
                    var oop = getPieceAt(b, [p.pos[0] + 1, p.pos[1]], opColor);
                    if (op != null)
                    {
                      if (op.moveLifetime == 1)
                        m.push([op.pos[0], op.pos[1] + 1, true, true]);
                    }
                    if (oop != null)
                    {
                      if (oop.moveLifetime == 1)
                        m.push([oop.pos[0], oop.pos[1] + 1, true, true]);
                    }
                }
                else
                {
                    for (var i = 0; i < 8; i++) {
                      var incd = 1 + (i + 1);
                      var inc = i + 1;
                      var c = [p.pos[0] - (incd), p.pos[1] - (incd), true, true];
                      var c2 = [p.pos[0] + (incd), p.pos[1] - (incd), true, true];

                      if (checkPiece(b,[p.pos[0] - (inc), p.pos[1] - (inc)], opColor))
                          if (!checkPiece(b,c))
                            m.push(c);
                      if (checkPiece(b,[p.pos[0] + (inc), p.pos[1] - (inc)], opColor))
                          if (!checkPiece(b,c2))
                            m.push(c2);
                    }
                    var op = getPieceAt(b, [p.pos[0] - 1, p.pos[1]], opColor);
                    var oop = getPieceAt(b, [p.pos[0] + 1, p.pos[1]], opColor);
                    if (op != null)
                    {
                      if (op.moveLifetime == 1)
                        m.push([op.pos[0], op.pos[1] - 1, true, true]);
                    }
                    if (oop != null)
                    {
                      if (oop.moveLifetime == 1)
                        m.push([oop.pos[0], oop.pos[1] - 1, true, true]);
                    }
                }

            break;
            case 2: // bishop
                var found = [false, false, false, false];
                for (var i = 1; i < 9; i++) {
                    var x1 = [p.pos[0] - i,p.pos[1] - i];
                    var x2 = [p.pos[0] + i,p.pos[1] + i];
                    var x3 = [p.pos[0] - i,p.pos[1] + i];
                    var x4 = [p.pos[0] + i,p.pos[1] - i];
                    if (!found[0])
                    {
                        var take = checkPiece(b, x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x1))
                            {
                                found[0] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x1.push(take);
                            m.push(x1);
                        }
                    }
                    if (!found[1])
                    {
                        var take = checkPiece(b, x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x2))
                            {
                                found[1] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x2.push(take);
                            m.push(x2);
                        }
                    }
                    if (!found[2])
                    {
                        var take = checkPiece(b, x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x3))
                            {
                                found[2] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x3.push(take);
                            m.push(x3);
                        }
                    }
                    if (!found[3])
                    {
                        var take = checkPiece(b, x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x4))
                            {
                                found[3] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x4.push(take);
                            m.push(x4);
                        }
                    }
                }
                break;
            case 3: // knight
                // too lazy to look for a cleaner solution
                var x1 = [];
                var x2 = [];
                if (!checkPiece(b, [p.pos[0] - 1, p.pos[1] + 2, opColor]) && !checkPiece(b, [p.pos[0], p.pos[1] + 1]) && !checkPiece(b, [p.pos[0], p.pos[1] + 2]))
                {
                    x1 = [p.pos[0] - 1, p.pos[1] + 2];
                    x1.push(checkPiece(b, x1, opColor));
                    m.push(x1);
                }
                if (!checkPiece(b, [p.pos[0] - 2, p.pos[1] + 1, opColor]) && !checkPiece(b, [p.pos[0] - 1, p.pos[1]]) && !checkPiece(b, [p.pos[0] - 2, p.pos[1]]))
                {
                    x2 = [p.pos[0] - 2, p.pos[1] + 1];
                    x2.push(checkPiece(b, x2, opColor));
                    m.push(x2);
                }
                if (!checkPiece(b, [p.pos[0] + 1, p.pos[1] + 2, opColor]) && !checkPiece(b, [p.pos[0], p.pos[1] + 1]) && !checkPiece(b, [p.pos[0], p.pos[1] + 2]))
                {
                    x1 = [p.pos[0] + 1, p.pos[1] + 2];
                    x1.push(checkPiece(b, x1, opColor));
                    m.push(x1);
                }
                if (!checkPiece(b, [p.pos[0] + 2, p.pos[1] + 1, opColor]) && !checkPiece(b, [p.pos[0] + 1, p.pos[1]]) && !checkPiece(b, [p.pos[0] + 2, p.pos[1]]))
                {
                    x2 = [p.pos[0] + 2, p.pos[1] + 1];
                    x2.push(checkPiece(b, x2, opColor));
                    m.push(x2);
                }
                if (!checkPiece(b, [p.pos[0] - 1, p.pos[1] - 2, opColor]) && !checkPiece(b, [p.pos[0], p.pos[1] - 1]) && !checkPiece(b, [p.pos[0], p.pos[1] - 2]))
                {
                    x1 = [p.pos[0] - 1, p.pos[1] - 2];
                    x1.push(checkPiece(b, x1, opColor));
                    m.push(x1);
                }
                if (!checkPiece(b, [p.pos[0] - 2, p.pos[1] - 1, opColor]) && !checkPiece(b, [p.pos[0] - 1, p.pos[1]]) && !checkPiece(b, [p.pos[0] - 2, p.pos[1]]))
                {
                    x2 = [p.pos[0] - 2, p.pos[1] - 1];
                    x2.push(checkPiece(b, x2, opColor));
                    m.push(x2);
                }
                if (!checkPiece(b, [p.pos[0] + 1, p.pos[1] - 2, opColor]) && !checkPiece(b, [p.pos[0], p.pos[1] - 1]) && !checkPiece(b, [p.pos[0], p.pos[1] - 2]))
                {
                    x1 = [p.pos[0] + 1, p.pos[1] - 2];
                    x1.push(checkPiece(b, x1, opColor));
                    m.push(x1);
                }
                if (!checkPiece(b, [p.pos[0] + 2, p.pos[1] - 1, opColor]) && !checkPiece(b, [p.pos[0] + 1, p.pos[1]]) && !checkPiece(b, [p.pos[0] + 2, p.pos[1]]))
                {
                    x2 = [p.pos[0] + 2, p.pos[1] - 1];
                    x2.push(checkPiece(b, x2, opColor));
                    m.push(x2);
                }
                break;
            case 4: // Rook
                var found = [false, false, false, false];
                for (var i = 1; i < 9; i++) {
                    var x1 = [p.pos[0] - i, p.pos[1]];
                    var x2 = [p.pos[0] + i, p.pos[1]];
                    var x3 = [p.pos[0], p.pos[1] + i];
                    var x4 = [p.pos[0], p.pos[1] - i];
                    if (!found[0])
                    {
                        var take = checkPiece(b, x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x1))
                            {
                                found[0] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x1.push(take);
                            m.push(x1);
                        }
                    }
                    if (!found[1])
                    {
                        var take = checkPiece(b, x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x2))
                            {
                                found[1] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x2.push(take);
                            m.push(x2);
                        }
                    }
                    if (!found[2])
                    {
                        var take = checkPiece(b, x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x3))
                            {
                                found[2] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x3.push(take);
                            m.push(x3);
                        }
                    }
                    if (!found[3])
                    {
                        var take = checkPiece(b, x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x4))
                            {
                                found[3] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x4.push(take);
                            m.push(x4);
                        }
                    }
                }
                break;
            case 5: // Queen
                // copypasted both bishop and rook lol
                var found = [false, false, false, false];
                for (var i = 1; i < 9; i++) {
                    var x1 = [p.pos[0] - i, p.pos[1]];
                    var x2 = [p.pos[0] + i, p.pos[1]];
                    var x3 = [p.pos[0], p.pos[1] + i];
                    var x4 = [p.pos[0], p.pos[1] - i];
                    if (!found[0])
                    {
                        var rp = getPieceAt(b, x1, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x1))
                            {
                                found[0] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x1.push(take);
                            m.push(x1);
                        }
                    }
                    if (!found[1])
                    {
                        var rp = getPieceAt(b, x2, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x2))
                            {
                                found[1] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x2.push(take);
                            m.push(x2);
                        }
                    }
                    if (!found[2])
                    {
                        var rp = getPieceAt(b, x3, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x3))
                            {
                                found[2] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x3.push(take);
                            m.push(x3);
                        }
                    }
                    if (!found[3])
                    {
                        var rp = getPieceAt(b, x4, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x4))
                            {
                                found[3] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x4.push(take);
                            m.push(x4);
                        }
                    }
                }
                found = [false, false, false, false];
                for (var i = 1; i < 9; i++) {
                    var x1 = [p.pos[0] - i,p.pos[1] - i];
                    var x2 = [p.pos[0] + i,p.pos[1] + i];
                    var x3 = [p.pos[0] - i,p.pos[1] + i];
                    var x4 = [p.pos[0] + i,p.pos[1] - i];
                    if (!found[0])
                    {
                        var rp = getPieceAt(b, x1, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x1))
                            {
                                found[0] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x1.push(take);
                            m.push(x1);
                        }
                    }
                    if (!found[1])
                    {
                        var rp = getPieceAt(b, x2, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x2))
                            {
                                found[1] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x2.push(take);
                            m.push(x2);
                        }
                    }
                    if (!found[2])
                    {
                        var rp = getPieceAt(b, x3, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x3))
                            {
                                found[2] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x3.push(take);
                            m.push(x3);
                        }
                    }
                    if (!found[3])
                    {
                        var rp = getPieceAt(b, x4, opColor);
                        if (rp != null)
                          if (rp.type == 6)
                            continue;
                        var take = checkPiece(b, x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (checkPiece(b,x4))
                            {
                                found[3] = true;
                                c = false;
                            }
                        if (c)
                        {
                            x4.push(take);
                            m.push(x4);
                        }
                    }
                }
                break;
            case 6: // King (I again, don't want to talk about it.)
                var x1 = [p.pos[0] - 1, p.pos[1] - 1];
                x1.push(checkPiece(b,x1, opColor));
                var x2 = [p.pos[0] - 1, p.pos[1] + 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                var x1 = [p.pos[0] - 1, p.pos[1] + 1];
                x1.push(checkPiece(b,x1, opColor));
                var x2 = [p.pos[0] - 1, p.pos[1] - 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] - 1];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1] + 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] + 1];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1] - 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1]];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1]];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0], p.pos[1] + 1];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0], p.pos[1] + 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] - 1, p.pos[1]];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0] - 1, p.pos[1]];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0], p.pos[1] - 1];
                x1.push(checkPiece(b,x1, opColor));
                x2 = [p.pos[0], p.pos[1] - 1];
                x2.push(checkPiece(b,x2, opColor));
                m.push(x1);
                m.push(x2);
                break;
        }
        
        return m;
    }

function getFile(pos)
{
    var file = "";
    switch(pos)
    {
        case 0:
            file = "a";
            break;
        case 1:
            file = "b";
            break;
        case 2:
            file = "c";
            break;
        case 3:
            file = "d";
            break;
        case 4:
            file = "e";
            break;
        case 5:
            file = "f";
            break;
        case 6:
            file = "g";
            break;
        case 7:
            file = "h";
            break;
    }
    return file;
}

function typeToPiece(t, c)
{
  var color = c == 1 ? "b" : "w";
  switch(t)
  {
    case 1:
      return color + "Pawn";
    case 2:
      return color + "Bishop";
    case 3:
      return color + "Knight";
    case 4:
      return color + "Rook";
    case 5:
      return color + "Queen";
    case 6:
      return color + "King";
  }
}

var posX;
var posY;
var dragged;
var def = false;
var selectedPiece = null;
var svgd = [];
var playable = [];

function clearBasedOn(array)
{
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var id = getFile(j) + (i + 1);
      if (array.includes(id))
      {
        var el = document.getElementById(id);
        el.style.backgroundColor = el.style.accentColor;
        el.innerHTML = "";
      }
    }
  }
}

function inverseClearBasedOn(array)
{
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var id = getFile(j) + (i + 1);
      if (!array.includes(id))
      {
        var el = document.getElementById(id);
        el.style.backgroundColor = el.style.accentColor;
        el.innerHTML = "";
      }
    }
  }
}

function drop() {
  document.removeEventListener("mousemove", mMove, false);
  document.removeEventListener("mouseup", drop, false);
  dragged.style.left = "";
  dragged.style.top = "";
  dragged.style.zIndex = "";
  selectedPiece = null;
  def = false;
  inverseClearBasedOn(state);
}    

function mMove(event) {

  if (!def)
  {
      posX = event.clientX;
      posY = event.clientY;
      def = true;
  }
  dragged.style.zIndex = "99";
  dragged.style.left = ((event.clientX - posX)) + "px";
  dragged.style.top = ((event.clientY - posY) - (dragged.clientHeight / 3)) + "px";
}    

function elementsOverlap(m, el2) {
  const domRect2 = el2.getBoundingClientRect();

  return !(m[0] < domRect2.left || 
    m[0] > domRect2.right || 
    m[1] < domRect2.top || 
    m[1] > domRect2.bottom)
}

function movePiece(oldPos, newPos, pawnTake)
{
  socket.emit("move", {gameId: gameId, piecePos: oldPos, newPos: newPos, pTake: pawnTake});
}

function setSelected(pos)
{
  var id = getFile(pos[0]) + (pos[1] + 1);


  var c = document.getElementById(id);
  c.style.backgroundColor = "#bbcb2b";

  selectionSquares.push(c);
}

function setSVG(pos, type, color, board)
{
  var id = getFile(pos[0]) + (pos[1] + 1);


  var c = document.getElementById(id);
  var previousColor = c.style.backgroundColor;
  if (type != -1)
  {
    var t = '/art/' + typeToPiece(type, color) + '.svg';
    c.innerHTML = "<img id='" + id + "Drag'src='" + t + "' style='user-select: none;position: relative; background-size: cover;background-position: center;width: 100%;height: 100%;'></img>";
    var img = document.getElementById(id + "Drag");
    img.draggable = false;
    img.setAttribute("data-path", t);
    if (myColor == color && board.winner == -1)
      if ((myColor == 0 && board.white) || (myColor == 1 && !board.white))
        img.addEventListener("mousedown", function(e) {
          dragged = img;
          var p = getPieceAt(board, pos);
          if (p == null)
            return;
          playable = [];
          selectedPiece = p;
          document.addEventListener("mousemove", mMove, false);
          document.addEventListener("mouseup", (e) => {
            tile = [];
            var take = false;
            for(var i = 0; i < movePos.length; i++)
            {
              var m = movePos[i];
              var el = document.getElementById(m[2]);
              if (el != null)
                if (elementsOverlap([e.clientX, e.clientY], el))
                {
                    take = m[3];
                    tile = [m[0], m[1]];
                    break;
                }
            }
            var correctMove = null;
            for(var ii = 0; ii < movePos.length; ii++)
            {
              var mm = movePos[ii];
              correctMove = mm;

              var nid = getFile(mm[0]) + (mm[1] + 1);
              var newCell = document.getElementById(nid);
              var color = newCell.getAttribute("data-originalColor");
              newCell.style.backgroundColor = color;
            }
            if (selectedPiece != null)
              if (tile.length != 0 && selectedPiece.pos != tile)
                movePiece(selectedPiece.pos, tile, correctMove[4]);
            c.style.backgroundColor = previousColor;
            drop();
          }, false);
          tile = [pos[0],pos[1]];
          c.style.backgroundColor = "#baca2b";
          setMoves(board, selectedPiece);
        }, false);
  }
  else
    c.innerHTML = "";
}

function move(divId, amt, t) {
    var elements = document.getElementById(divId).children;
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.transition = "transform " + t.toString() + "s ease-in-out";
      elements[i].style.transform = "translateY(" + amt.toString() + "%)";
    }
  }

function setPieces(b)
{
  var ar = [];
  // x = j
  // y = i
  // simple 9x9 2d array type thing ish
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var p = getPieceAt(b, [j,i]);

      if (p != null)
      {
        setSVG([j,i], p.type, p.color, b);
        var f = getFile(j) + (i + 1).toString();
        ar.push(f);
      }
      else
        setSVG([j,i],-1, 0, b);
    }
  }
  return ar;
}

function setMoves(b, piece)
{
  var moves = getAvaliableMoves(b, piece);

  var stateWithMoves = [...state];
  movePos = [];
  for (var i = 0; i < moves.length; i++) {
    var m = moves[i];
    if (m[0] < 0 || m[0] > 7 || m[1] < 0 || m[1] > 7)
      continue;

    var id = getFile(m[0]) + (m[1] + 1);
    var p = getPieceAt(b, [m[0], m[1]]);
    if (p != null && !m[2])
        continue;
    stateWithMoves.push(id);
    var mo = [m[0],m[1], id + "Move", false];
    var c = document.getElementById(id);
    if (m[2])
    {
      mo[2] = id + "Drag";
      if (m[3])
      {
        mo[2] = id;
        mo[4] = true;
      }
      else
        mo[4] = false;
      mo[3] = true;
      c.style.backgroundColor = "#ca2b2b";
    }
    else
    {
      var t = '/art/playable.svg';
      c.innerHTML = "<img id='" + id + "Move'src='" + t + "' style='user-select: none;position: relative; background-size: cover;background-position: center;width: 100%;height: 100%;'></img>";
      var img = document.getElementById(id + "Move");
      img.draggable = false;
    }
    movePos.push(mo);
  }
  inverseClearBasedOn(stateWithMoves);
}



var form = document.getElementById('form');
var form2 = document.getElementById('lobbyForm');

form.addEventListener('submit', function(e) {
  if (username.length > 0)
    return;
  var textbox = document.getElementById("textbox");
  e.preventDefault();
  if (urlParams.get('challenge') != null)
    gameId = urlParams.get('challenge');
  socket.emit('name', {name: textbox.value, id: gameId});
  textbox.value = '';
});


var tbox1 = document.getElementsByClassName("lobbyText")[0];
var check = document.getElementsByClassName("checkLobby")[0];
tbox1.addEventListener("keypress", function(event) {
  if (event.key === "Enter" && gameId.length == 0) {
    if (tbox1.value) {
        socket.emit('create', {name: tbox1.value, isPrivate: check.checked});
        tbox1.value = '';
      }
  }
});

var tbox3 = document.getElementById("chatbox");
tbox3.addEventListener("keypress", function(event) {
  if (event.key === "Enter" && gameId.length != 0) {
    if (tbox3.value) {
        if (tbox3.value.length != 0 && tbox3.value.length < 512)
        {
          socket.emit('chat', {message: tbox3.value, gameId: gameId});
          tbox3.value = '';
        }
      }
  }
});

var tbox2 = document.getElementsByClassName("codeText")[0];
tbox2.addEventListener("keypress", function(event) {
  
    if (event.key === "Enter" && gameId.length == 0) {
      if (tbox2.value) {
          socket.emit('join', tbox2.value);
          tbox2.value = '';
        }
    }
  });

socket.on("error", function(v) {
  console.warn("[Normal Chess] " + v);
  createNotification(v);
});

socket.on("nick", function(v) {
  username = "";
  gameId = '';
  move("nickname", 0, 0.01);
  move("lobby", 120, 0.01);
  move("game", 120, 0.01);
  move("lobbies", 120, 0.01);
});

socket.on("lobbies", function(v) {
    gameId = '';
    var lobbies = v["list"];
    username = v["username"];

    var n = document.querySelector("#name");
    n.innerHTML = "You are playing as: <b style='color: lightblue'>" + username + "</b>";
    
    var lobs = document.querySelector("#lobs");
    lobs.innerHTML = "";

    if (lobbies.length == 0)
    {
        lobs.innerHTML = "<p>No lobbies found!</p>";
    }
    else
    {
        lobbies.forEach(l => {
            lobs.innerHTML += "<p><b>" + l.gameName + "</b></p><p>Players: " + l.playerCount.toString() + "/2 </p><button id='" + l.gameId + "join'>Join</button>";
            var b = document.getElementById(l.gameId + "join");
            b.addEventListener("click", function() {
                socket.emit("join", l.gameId);
            });
        });
    }
    
    move("nickname", 120, 1);
    move("lobby", 120, 1);
    move("game", 120, 1);
    move("lobbies", -100, 1);

});

document.getElementById("startButton").addEventListener("click", function() {
  socket.emit("start", gameId);
});


document.getElementById("leaveButton").addEventListener("click", function() {
    socket.emit("leave", gameId);
});

document.getElementById("draw").addEventListener("click", function() {
  socket.emit("draw", gameId);
});

document.getElementById("resign").addEventListener("click", function() {
    socket.emit("resign", gameId);
});

socket.on("lobby", function(v) {
    var game = v["lobby"];
    gameId = game.gameId;
    move("nickname", 120, 1);
    move("lobbies", 120, 1);
    move("game", 120, 1);
    move("lobby", -200, 1);

    var lobs = document.querySelector("#lobs");
    lobs.innerHTML = "";

    var ln = document.getElementById("lobbyName");
    ln.innerHTML = game.gameName + " <p>" + game.link + "</p>\n<p>Players: " + game.playerCount.toString() + "/2</p>";
    var list = document.getElementById("players");
    list.innerHTML = "";
    game.players.forEach(p => {
        list.innerHTML += "<h3>" + p + "</h3>";
    });
});

socket.on("chat", function(v) {
  var el = document.getElementById("chatScroll");

  el.innerHTML += v;
  el.scrollTo(0, el.scrollHeight);
});

socket.on("start", function(v) {
  // Create chess and stuff
  var el = document.getElementById("chatScroll");

  el.innerHTML = "";
  board = v["board"];
  var l = v["lobby"];
  move("nickname", 120, 1);
  move("lobbies", 120, 1);
  move("game", -200, 1);
  move("lobby", 120, 1);

  myColor = v["isWhite"] ? 0 : 1;

  var op = document.getElementById("opText");
  op.innerHTML = l.op;
  
  var you = document.getElementById("youText");
  you.innerHTML = username;

  // Get the div element where the chessboard will be placed
  var chessboard = document.getElementById("chess");
  
  chessboard.innerHTML = "";
  chessboard.style.width = "45%";
  chessboard.style.height = "75%";
  
  // Create 8 rows and 8 cells for each row
  for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
          var cell = document.createElement("div");
          cell.style.height = "calc(100% / 8)";
          cell.style.width = "calc(100% / 8)";
          cell.style.float = "left";

          var s = i + 1;
          if (v["isWhite"])
            s = (8 - i);
          var jj = j;
          if (!v["isWhite"])
            jj = (7 - j);
          
          cell.id = getFile(jj) + s;
  
          // Alternate between green and white colors
          if ((i + j) % 2 === 0) {
              cell.style.backgroundColor = "#769656";
          } else {
              cell.style.backgroundColor = "#eeeed2";
          }
  
          cell.style.backgroundRepeat = "no-repeat";
          cell.style.display = "flex";
          cell.style.flexWrap = "wrap";
          cell.style.alignItems = "center";
          cell.style.justifyContent = "center";
          cell.style.maxWidth = "calc(100% / 8)";
          cell.style.maxHeight = "calc(100% / 8)";
          cell.style.accentColor = cell.style.backgroundColor;
          cell.setAttribute("data-originalColor", cell.style.backgroundColor);
          // Add the cell to the chessboard div
          chessboard.appendChild(cell);

      }
  }
  svg = [];
  state = setPieces(board);
  inverseClearBasedOn(state);

  draw.disabled = false;
  resign.disabled = false;

  chessboard.style.display = "flex";
  chessboard.style.flexWrap = "wrap";
  chessboard.style.alignItems = "center";
  chessboard.style.justifyContent = "center";
  chessboard.style.maxWidth = "26vw";
  chessboard.style.maxHeight = "40vh";

});

function setListMoves(moves)
{
  var l = document.getElementById("moves");
  var content = "<ol><li>";
  for(var i = 0; i < moves.length; i++)
  {
    var m = moves[i];
    if (i % 2 == 1)
    {
      content += "- <b>" + m.mName + "</b></li>"
      if (i + 1 < moves.length)
        content += "<li>";
    }
    else
      content += "<b>" + m.mName + "</b>";
  }
  l.innerHTML = content;
  l.scrollTo(0, l.scrollHeight);
}

function leaveGame(e)
{
  socket.emit("giveMeLobbies");
  leave.removeEventListener("click", leaveGame);
  leave.style.opacity = 0;
  leave.disabled = true;
}

socket.on("move", function(info) {
  board = info["b"];
  svg = [];
  state = setPieces(board);
  inverseClearBasedOn(state);
  setListMoves(board.moves);
  selectionSquares.forEach(s => {
    s.style.backgroundColor = s.getAttribute("data-originalColor");
  });
  selectionSquares = [];
  setSelected(info["movePos"]["ppos"]);
  setSelected(info["movePos"]["newPos"]);
  if (board.winner != -1)
  {
    draw.disabled = true;
    resign.disabled = true;
    leave.style.opacity = 1;
    leave.disabled = false;
    leave.addEventListener("click", leaveGame, false);
  }
});

socket.on("disconnect", function(v) {
  console.error("Disconnected from server.");
  createNotification("Disconnected from the server.");
});