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


class Player {
    socket = null;
    ip = "";
    username = "";
    inLobby = false;
    lookingForLobby = false;
    constructor(ip)
    {
        this.ip = ip;
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