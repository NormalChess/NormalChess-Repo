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

    static convertPieceToName(type, moveType, from, pos)
    {
        switch(moveType)
        {
            case 0: // regular move
                var output = "";
                pos.every(m => {
                    var c = m.capture;
                    var f = Move.getFile(m);
                    var lf = Move.getFile(from);
                    var t = f + (m.y + 1);
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
    constructor(_from, _pos,_type, _moveType, _capture)
    {
        this.mName = Move.convertPieceToName(_type, _moveType, _from, _pos);
        this.pos = _pos;
    }
}

class Piece {
    id = 0;
    svgId = "";
    moveLifetime = 0;
    color = 0;
    type = 0;
    pos = [0,0];
    lastPos = [0,0];
    move = null;
    constructor(_pos, _type, _c, _id)
    {
        this.color = _c;
        this.type = _type;
        this.pos = _pos;
        this.id = _id;
    }
}
  
class Board {
    moves = [];
    pieces = [];

    white = true;

    getPieceAt(pos, color = -1)
    {
        var p = null;
        for(var i = 0; i < this.pieces.length; i++)
        {
          var fp = this.pieces[i];
          if (fp.pos[0] == pos[0] && fp.pos[1] == pos[1] && (fp.color == color || color == -1))
          {
            p = fp;
            break;
          }
        }
        return p;
    }

    getAvaliableMoves(p, pColor = true)
    {
        var m = [];
        var opColor = pColor ? 1 : 0;
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
                    if (this.getPieceAt([p.pos[0] - 1, p.pos[1] + 1], opColor) != null)
                        m.push([p.pos[0] - 1,p.pos[1] + 1], true);
                    if (this.getPieceAt([p.pos[0] + 1, p.pos[1] + 1], opColor) != null)
                        m.push([p.pos[0] + 1,p.pos[1] + 1], true);
                }
                else
                {
                    if (this.getPieceAt([p.pos[0] - 1, p.pos[1] - 1], opColor) != null)
                        m.push([p.pos[0] - 1,p.pos[1] - 1], true);
                    if (this.getPieceAt([p.pos[0] + 1, p.pos[1] - 1], opColor) != null)
                        m.push([p.pos[0] + 1,p.pos[1] - 1], true);
                }

            break;
            case 2: // bishop
                var found = [false, false, false, false];
                for (var i = 0; i < 8; i++) {
                    var x1 = [p.pos[0] - i,p.pos[1] - i];
                    var x2 = [p.pos[0] + i,p.pos[1] + i];
                    var x3 = [p.pos[0] - i,p.pos[1] + i];
                    var x4 = [p.pos[0] + i,p.pos[1] - i];
                    if (!found[0])
                    {
                        var take = this.getPieceAt(x1, opColor) != null;
                        found[0] = take;
                        m.push(x1, take);
                    }
                    if (!found[1])
                    {
                        var take = this.getPieceAt(x2, opColor) != null;
                        found[1] = take;
                        m.push(x2, take);
                    }
                    if (!found[2])
                    {
                        var take = this.getPieceAt(x3, opColor) != null;
                        found[2] = take;
                        m.push(x3, take);
                    }
                    if (!found[3])
                    {
                        var take = this.getPieceAt(x4, opColor) != null;
                        found[3] = take;
                        m.push(x4, take);
                    }
                }
                break;
            case 3: // knight
                // too lazy to look for a cleaner solution
                var x1 = [p.pos[0] - 1, p.pos[1] + 2];
                x1.push(this.getPieceAt(x1, opColor) != null);
                var x2 = [p.pos[0] - 2, p.pos[1] + 1];
                x2.push(this.getPieceAt(x2, opColor) != null);
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] + 2];
                x1.push(this.getPieceAt(x1, opColor) != null);
                x2 = [p.pos[0] + 2, p.pos[1] + 1];
                x2.push(this.getPieceAt(x2, opColor) != null);
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] - 1, p.pos[1] - 2];
                x1.push(this.getPieceAt(x1, opColor) != null);
                x2 = [p.pos[0] - 2, p.pos[1] - 1];
                x2.push(this.getPieceAt(x2, opColor) != null);
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] - 2];
                x1.push(this.getPieceAt(x1, opColor) != null);
                x2 = [p.pos[0] + 2, p.pos[1] - 1];
                x2.push(this.getPieceAt(x2, opColor) != null);
                m.push(x1);
                m.push(x2);
                break;
        }
        
        return m;
    }

    removePiece(piece)
    {
        for(var i=0; i < this.pieces.length; i++) {
            if(this.pieces[i].id == piece.id)
            {
               this.pieces.splice(i,1)
               break;
            }
         }
    }

    makeMove(from, to, opColor, myColor)
    {
        var piece = this.getPieceAt(to, opColor);
        var fpiece = this.getPieceAt(from, myColor);
        var take = false;
        if (piece != null)
        {
            take = true;
            this.removePiece(piece);
        }

        this.moves.push(new Move(from, to, fpiece.type, 0, take));
        fpiece.pos = to;
        fpiece.moveLifetime++;
    }

    constructor()
    {
        // P1
        this.pieces.push(new Piece([0,0], 4, 0, 1));
        this.pieces.push(new Piece([1,0], 3, 0, 2));
        this.pieces.push(new Piece([2,0], 2, 0, 3));
        this.pieces.push(new Piece([3,0], 5, 0, 4));
        this.pieces.push(new Piece([4,0], 6, 0, 5));
        this.pieces.push(new Piece([5,0], 2, 0, 6));
        this.pieces.push(new Piece([6,0], 3, 0, 7));
        this.pieces.push(new Piece([7,0], 4, 0, 8));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,1], 1, 0, 9 + i));
        }
        // P2
        this.pieces.push(new Piece([0,7], 4, 1, 9));
        this.pieces.push(new Piece([1,7], 3, 1, 10));
        this.pieces.push(new Piece([2,7], 2, 1, 11));
        this.pieces.push(new Piece([3,7], 5, 1, 12));
        this.pieces.push(new Piece([4,7], 6, 1, 13));
        this.pieces.push(new Piece([5,7], 2, 1, 14));
        this.pieces.push(new Piece([6,7], 3, 1, 15));
        this.pieces.push(new Piece([7,7], 4, 1, 16));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,6], 1, 1, 17 + i));
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