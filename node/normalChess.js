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
    constructor(ip)
    {
        this.ip = ip;
    }
}

class Lobby {
    gameId = "";
    gameName = "";
    playerCount = 0;
    playerNames = [];
    players = [];
    host = null;
    started = false;
    isPrivate = false;

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