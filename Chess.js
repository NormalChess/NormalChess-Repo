class Move {
    
    static getFile(pos)
    {
        var file = "";
        switch(pos[0])
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

    static convertPieceToName(type, moveType, pos)
    {
        switch(moveType)
        {
            case 0: // regular move
                var output = "";
                pos.every(m => {
                    var c = m.capture;
                    var f = this.getFile(m.x);
                    var lf = this.getFile(m.lX);
                    var t = f + (8 - m).y.toString();
                    if (c)
                    {
                        if (type != 1) // pawn has a different notation
                            t = "x" + t;
                        else
                        {
                            t = lf + "x" + t;
                            output += t + " ";
                            return true;
                        }
                    }

                    switch(type)
                    {
                        case 2: // bishop
                            t = "B" + t;
                            break;
                        case 3: // knight
                            t = "N" + t;
                            break;
                        case 4: // Rook
                            t = "R" + t;
                            break;
                        case 5: // Queen
                            t = "Q" + t;
                            break;
                        case 6: // King
                            t = "K" + t;
                            break;
                    }

                    output += t + " ";
                    return true;
                });
                return output;
            case 1: // Uno
                return "uno";
            case 2: // Blackjack win
                return "blackjackWin";
            case 3: // Blackjack lose
                return "blackjackLose";
        }
    }

    mName = "";
    pos = [];
    constructor(_pos,_type, _moveType, _capture)
    {
        this.mName = convertPieceToName(_type, _moveType, _pos);
        this.pos = _pos;
    }
}

class Piece {
    svgId = "";
    color = 0;
    type = 0;
    pos = [0,0];
    lastPos = [0,0];
    move = null;
    constructor(_pos, _type, _c)
    {
        this.color = _c;
        this.type = _type;
        this.pos = _pos;
    }

    move(_pos, capture)
    {
        lastPos = pos;
        pos = _pos;
        return new Move(lastPos, pos, type, capture);
    }
}
  
class Board {
    moves = [];
    pieces = [];

    white = true;

    makeMove()
    {

    }

    constructor()
    {
        // P1
        this.pieces.push(new Piece([0,0], 3, 0));
        this.pieces.push(new Piece([1,0], 2, 0));
        this.pieces.push(new Piece([2,0], 1, 0));
        this.pieces.push(new Piece([3,0], 4, 0));
        this.pieces.push(new Piece([4,0], 5, 0));
        this.pieces.push(new Piece([5,0], 1, 0));
        this.pieces.push(new Piece([6,0], 2, 0));
        this.pieces.push(new Piece([7,0], 3, 0));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,1], 1, 0));
        }
        // P2
        this.pieces.push(new Piece([0,7], 3, 1));
        this.pieces.push(new Piece([1,7], 2, 1));
        this.pieces.push(new Piece([2,7], 1, 1));
        this.pieces.push(new Piece([3,7], 4, 1));
        this.pieces.push(new Piece([4,7], 5, 1));
        this.pieces.push(new Piece([5,7], 1, 1));
        this.pieces.push(new Piece([6,7], 2, 1));
        this.pieces.push(new Piece([7,7], 3, 1));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,6], 1, 1));
        }
    }
}

// Node.JS (wont work on browsers obviously)

if (typeof module !== 'undefined')
{
    module.exports = {
        Piece,
        Board,
        Move
    }
}