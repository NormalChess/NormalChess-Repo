// Helpers

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

function random(min, max)
{
    return Math.floor(Math.random() * (max - min) + min);
}


class Player {
    socket = null;
    ip = "";
    username = "";
    inLobby = false;
    lookingForLobby = false;

    inBlackjack = false;
    chips = 2;
    value = 0;
    dealer = 0;
    outcome = -1;
    lossAmount = 0;

    constructor(ip)
    {
        this.ip = ip;
    }

    deal(stand)
    {
        if (!stand)
            this.value += random(1,11);
        this.dealer += random(1,11);
        // cheats
        if (this.dealer > 19 && this.dealer < 24)
            this.dealer = 21;
        if (this.value > 21 || this.dealer == 21)
        {
            this.outcome = 0;
            this.lossAmount = this.chips / 2;
            this.chips /= 2;
            if (this.chips != 1)
            {
                this.chips -= 1;
                this.lossAmount += 1;
            }
            this.chips = Math.floor(this.chips);
            this.lossAmount = Math.floor(this.lossAmount);
            if (this.chips < 0)
                this.chips = 0;
        }
        else if (this.dealer > 21 || this.value == 21)
        {   
            if (this.value == 21 && this.dealer == 21)
            {
                this.outcome = 2;
                return;
            }
            this.chips += 2;
            this.outcome = 1;
        }
    }
}

class Lobby {
    op = "";
    gameId = "";
    gameName = "";
    chat = "";
    playerCount = 0;
    playerNames = [];
    players = [];
    host = null;
    started = false;
    isPrivate = false;
    board = null;
    drawOffer = false;
    drawPlayer = null;

    colorPromotion = -1;
    pieceToPromote = null;

    containsPlayer(p)
    {
        var b = false;
        this.players.forEach(pl => {
            if (pl.username == p.username && pl.ip == p.ip)
            {
                b = true;
            }
        });
        return b;
    }

    addChat(name, msg)
    {
        let m = msg;
        m = m.replace(/<[^>]*>?/gm, '');

        let rm = "<p><b>" + name + "</b>: " + msg + "</p>";

        // 100% going to get xss'd
        this.chat += rm;
        return  rm;
    }

    constructor(name)
    {
        this.gameId = generateRandomString(8);
        this.gameName = name;
        this.playerCount = 0;
    }
}

module.exports = {
    Player,
    Lobby,
    generateRandomString
}