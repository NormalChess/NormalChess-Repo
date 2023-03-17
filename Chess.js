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

    static convertPieceToName(type, moveType, from, pos, en)
    {
        switch(moveType)
        {
            case 0: // regular move
                var output = "";
                pos.every(m => {
                    var c = m[2];
                    var f = Move.getFile(m);
                    var lf = Move.getFile(from);
                    var t = f + (m[1] + 1);
                    if (en)
                        t = lf + "->" + t;
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
    constructor(_from, _pos,_type, _moveType, _capture, en)
    {
        this.mName = Move.convertPieceToName(_type, _moveType, _from, _pos, en);
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

    winner = -1;

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

    checkPiece(cords, color)
    {
        return this.getPieceAt(cords, color) != null;
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
                        return m;
                    }
                    m.push([p.pos[0],p.pos[1] - 1, false]);
                    m.push([p.pos[0],p.pos[1] - 2, false]);
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
                    if (this.checkPiece([p.pos[0] - 1, p.pos[1] + 1], opColor))
                        m.push([p.pos[0] - 1,p.pos[1] + 1, true]);
                    if (this.checkPiece([p.pos[0] + 1, p.pos[1] + 1], opColor))
                        m.push([p.pos[0] + 1,p.pos[1] + 1, true]);
                    var op = this.getPieceAt([p.pos[0] - 1, p.pos[1]], opColor);
                    var oop = this.getPieceAt([p.pos[0] + 1, p.pos[1]], opColor);
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
                    if (this.checkPiece([p.pos[0] - 1, p.pos[1] - 1], opColor))
                        m.push([p.pos[0] - 1,p.pos[1] - 1, true]);
                    if (this.checkPiece([p.pos[0] + 1, p.pos[1] - 1], opColor))
                        m.push([p.pos[0] + 1,p.pos[1] - 1, true]);
                    var op = this.getPieceAt([p.pos[0] - 1, p.pos[1]], opColor);
                    var oop = this.getPieceAt([p.pos[0] + 1, p.pos[1]], opColor);
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
                        var take = this.checkPiece(x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x1))
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
                        var take = this.checkPiece(x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x2))
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
                        var take = this.checkPiece(x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x3))
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
                        var take = this.checkPiece(x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x4))
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
                if (!this.checkPiece([p.pos[0] - 1, p.pos[1] + 1]) && !this.checkPiece([p.pos[0] - 1, p.pos[1]]))
                {
                    x1 = [p.pos[0] - 1, p.pos[1] + 2];
                    x1.push(this.checkPiece(x1, opColor));
                    x2 = [p.pos[0] - 2, p.pos[1] + 1];
                    x2.push(this.checkPiece(x2, opColor));
                    m.push(x1);
                    m.push(x2);
                }
                if (!this.checkPiece([p.pos[0] + 1, p.pos[1] + 1]) && !this.checkPiece([p.pos[0] + 1, p.pos[1]]))
                {
                    x1 = [p.pos[0] + 1, p.pos[1] + 2];
                    x1.push(this.checkPiece(x1, opColor));
                    x2 = [p.pos[0] + 2, p.pos[1] + 1];
                    x2.push(this.checkPiece(x2, opColor));
                    m.push(x1);
                    m.push(x2);
                }
                if (!this.checkPiece([p.pos[0] - 1, p.pos[1] - 1]) && !this.checkPiece([p.pos[0] - 1, p.pos[1]]))
                {
                    x1 = [p.pos[0] - 1, p.pos[1] - 2];
                    x1.push(this.checkPiece(x1, opColor));
                    x2 = [p.pos[0] - 2, p.pos[1] - 1];
                    x2.push(this.checkPiece(x2, opColor));
                    m.push(x1);
                    m.push(x2);
                }
                if (!this.checkPiece([p.pos[0] + 1, p.pos[1] - 1]) && !this.checkPiece([p.pos[0] + 1, p.pos[1]]))
                {
                    x1 = [p.pos[0] + 1, p.pos[1] - 2];
                    x1.push(this.checkPiece(x1, opColor));
                    x2 = [p.pos[0] + 2, p.pos[1] - 1];
                    x2.push(this.checkPiece(x2, opColor));
                    m.push(x1);
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
                        var take = this.checkPiece(x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x1))
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
                        var take = this.checkPiece(x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x2))
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
                        var take = this.checkPiece(x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x3))
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
                        var take = this.checkPiece(x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x4))
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
                        var take = this.checkPiece(x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x1))
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
                        var take = this.checkPiece(x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x2))
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
                        var take = this.checkPiece(x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x3))
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
                        var take = this.checkPiece(x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x4))
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
                        var take = this.checkPiece(x1, opColor);
                        found[0] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x1))
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
                        var take = this.checkPiece(x2, opColor);
                        found[1] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x2))
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
                        var take = this.checkPiece(x3, opColor);
                        found[2] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x3))
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
                        var take = this.checkPiece(x4, opColor);
                        found[3] = take;
                        var c = true;
                        if (!take)
                            if (this.checkPiece(x4))
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
                x1.push(this.checkPiece(x1, opColor));
                var x2 = [p.pos[0] - 1, p.pos[1] + 1];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                var x1 = [p.pos[0] - 1, p.pos[1] + 1];
                x1.push(this.checkPiece(x1, opColor));
                var x2 = [p.pos[0] - 1, p.pos[1] - 1];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] - 1];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1] + 1];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1] + 1];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1] - 1];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] + 1, p.pos[1]];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0] + 1, p.pos[1]];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0], p.pos[1] + 1];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0], p.pos[1] + 1];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0] - 1, p.pos[1]];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0] - 1, p.pos[1]];
                x2.push(this.checkPiece(x2, opColor));
                m.push(x1);
                m.push(x2);
                x1 = [p.pos[0], p.pos[1] - 1];
                x1.push(this.checkPiece(x1, opColor));
                x2 = [p.pos[0], p.pos[1] - 1];
                x2.push(this.checkPiece(x2, opColor));
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
        var wKings = 0;
        var bKings = 0;
        for(var i=0; i < this.pieces.length; i++) {
            var p = this.pieces[i];
            if (p.type == 6)
                if (p.color == 0)
                    wKings++;
                else
                    bKings++;
        }

        if (wKings == 0)
            this.winner = 1;
        if (bKings == 0)
            this.winner = 0;
    }

    makeMove(from, to, opColor, myColor, enpassant)
    {
        var piece = this.getPieceAt(to, opColor);
        var fpiece = this.getPieceAt(from, myColor);
        var take = false;
        if (piece != null)
        {
            take = true;
            this.removePiece(piece);
        }

        var t = to;
        to.push(take);

        this.moves.push(new Move(from, [t], fpiece.type, 0, take, enpassant));
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
        this.pieces.push(new Piece([5,0], 2, 0, 7));
        this.pieces.push(new Piece([6,0], 3, 0, 6));
        this.pieces.push(new Piece([7,0], 4, 0, 8));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,1], 1, 0, 9 + i));
        }
        // P2
        this.pieces.push(new Piece([0,7], 4, 1, 17));
        this.pieces.push(new Piece([1,7], 3, 1, 18));
        this.pieces.push(new Piece([2,7], 2, 1, 19));
        this.pieces.push(new Piece([3,7], 5, 1, 20));
        this.pieces.push(new Piece([4,7], 6, 1, 21));
        this.pieces.push(new Piece([5,7], 2, 1, 22));
        this.pieces.push(new Piece([6,7], 3, 1, 23));
        this.pieces.push(new Piece([7,7], 4, 1, 24));
        for(var i = 0; i < 8; i++)
        {
            this.pieces.push(new Piece([i,6], 1, 1, 25 + i));
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