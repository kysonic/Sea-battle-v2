function seaBattle(gameAreaId) {
  // Определяем границы поля
  this.gameFieldBorderX = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  this.gameFieldBorderY = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  // Получаем элемент поля по ID
  this.gameArea = document.querySelector("#game-area-id");
  this.gameArea.innerHTML = "";
  //  Объявляем способ хранения кораблей
  this.shipsConfiguration = [
    { maxShips: 1, pointCount: 4 },
    { maxShips: 2, pointCount: 3 },
    { maxShips: 3, pointCount: 2 },
    { maxShips: 4, pointCount: 1 },
  ];
  //   Имена переменных для имени игрока и задержки выстрела компьютера
  this.userName = null;
  this.computerName = "Computer";
  this.computerDelay = 1000;

  // Подсчет очков для победы
  this._hitsForWin = 0;

  shipsConfiguration.forEach((element) => {
    this._hitsForWin = +(
      this.shipsConfiguration[element].maxShips *
      this.shipsConfiguration[element].pointCount
    );
  });
  //  Карты кораблей для Игрока и компьютера
  this._computerShipsMap = null;
  this._userShipsMap = null;

  this.gameStopped = false;

  // Константы для обозначений клетки с кораблем и пустой клетки на поле боя

  this.CELL_WITH_SHIP = 1;
  this.CELL_EMPTY = 0;

  // Переменные которые далее будут использоваться для HTML разметки
  this.cumputerInfo = null;
  this.userInfo = null;
  this.toolbar = null;
  this.startGameButton = null;
  this.computerGameField = null;
  this.userGameField = null;
}

seaBattle.prototype = {
  // Вызов ф-й создающих необходимую для игры разметку
  init: function () {
    this.createToolbar(), this.createGameFields(), this.createFooter();
  },
  createToolbar: function () {
    this.toolbar = document.createElement("div");
    this.toolbar.setAttribute("class", "toolbar");
    this.gameArea.appendChild(this.toolbar);
  },
  createGameFields: function () {
    let computerGameArea = document.createElement("div");
    computerGameArea.setAttribute("class", "computer-game-area");
    this.gameArea.appendChild(computerGameArea);

    let userGameArea = document.createElement("div");
    userGameArea.setAttribute("class", "user-game-area");
    this.gameArea.appendChild(userGameArea);

    this.computerInfo = document.createElement("div");
    computerGameArea.appendChild(this.computerInfo);

    this.userInfo = document.createElement("div");
    userGameArea.appendChild(this.userInfo);

    this.computerGameField = document.createElement("div");
    this.computerGameField.setAttribute("class", "game-field");

    this.userGameField = document.createElement("div");
    this.userGameField.setAttribute("class", "game-field");

    computerGameArea.appendChild(this.computerGameField);
    userGameArea.appendChild(this.userGameField);
  },
  createFooter: function () {
    let footer = document.createElement("div");
    footer.setAttribute("class", "footer");

    this.startGameButton = document.createElement("button");
    this.startGameButton.innerHTML = "Start the Game";
    this.startGameButton.setAttribute("class", "btn");
    this.startGameButton
      .addEventListener("click", () => {
        this.startNewGame();
      })
      .bind(this);
    footer.appendChild(this.startGameButton);
    this.gameArea.appendChild(footer);
  },
  startNewGame: function () {
    this.userName = this.userName || prompt('Enter your name,"Viktor"');
    this.computerName = this.computerName;

    if (!this.userName) {
      alert("Wrong name");
      return;
    }
    this.startGameButton.innerHTML = "Start over";
    this.computerName.innerHTML = `${this.computerName} your Enemy`;
    this.userName.innerHTML = `${this.userName} your field`;

    this._computerShipsMap = this.generateRandomShipMap();
    this._userShipsMap = this.generateRandomShipMap();
    this._computerShotMap = this.generateShotMap();

    this._userHits = 0;
    this._computerHits = 0;
    this._blockHeight = null;
    this._gameStopped = false;
    this._computerGoes = false;

    this.drawGamePoints();
    this.updateToolbar();
  },

  drawGamePoints: function () {
    this.gameFieldBorderY.forEach((yPoint) =>
      this.gameFieldBorderX.forEach((xPoint) => {
        let computerPointBlock = getOrCreateBlock(yPoint, xPoint);
        computerPointBlock.addEventListener(
          "click",
          function (e) {
            this.userFire(e);
          }.bind(this)
        );
        let userPointBlock = getOrCreateBlock(yPoint, xPoint, "user");
        if (this._userShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP) {
          userPointBlock.setAttribute("class", "ship");
        }
      })
    );
  },
  // _blockHeight = null,

  getOrCreatePointBlock: function (yPoint, xPoint, type) {
    var id = this.getPointBlockIdByCoords(yPoint, xPoint, type);
    var block = document.getElementById(id);
    if (block) {
      block.innerHTML = "";
      block.setAttribute("class", "");
    } else {
      block = document.createElement("div");
      block.setAttribute("id", id);
      block.setAttribute("data-x", xPoint);
      block.setAttribute("data-y", yPoint);
      if (type && type === "user") {
        this.userGameField.appendChild(block);
      } else {
        this.pcGameField.appendChild(block);
      }
    }
    block.style.width = 100 / this.gameFieldBorderY.length + "%";
    if (!this._blockHeight) {
      this._blockHeight = block.clientWidth;
    }
    block.style.height = this._blockHeight + "px";
    block.style.lineHeight = this._blockHeight + "px";
    block.style.fontSize = this._blockHeight + "px";
    return block;
  },

  /**
   * Возвращает id игровой ячейки, генериремого на базе координат
   * и типа игрового поля
   * @param {type} yPoint
   * @param {type} xPoint
   * @param {type} type
   * @return {String}
   */
  getPointBlockIdByCoords: function (yPoint, xPoint, type) {
    if (type && type === "user") {
      return "user_x" + xPoint + "_y" + yPoint;
    }
    return "pc_x" + xPoint + "_y" + yPoint;
  },

  /**
   * Создает масив с координатами полей, из которых компьютер
   * случайно выбирает координаты для обстрела
   * @return {Array|SeeBattle.prototype.generateShotMap.map}
   */
  generateShotMap: function () {
    var map = [];
    for (var yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
      for (var xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
        map.push({ y: yPoint, x: xPoint });
      }
    }
    return map;
  },

  /**
   * Генерирует массив содержащий информацию о том есть или нет корабля
   * @return {Array}
   */
  generateRandomShipMap: function () {
    var map = [];
    // генерация карты расположения, вклчающей отрицательный координаты
    // для возможности размещения у границ
    for (var yPoint = -1; yPoint < this.gameFieldBorderY.length + 1; yPoint++) {
      for (
        var xPoint = -1;
        xPoint < this.gameFieldBorderX.length + 1;
        xPoint++
      ) {
        if (!map[yPoint]) {
          map[yPoint] = [];
        }
        map[yPoint][xPoint] = this.CELL_EMPTY;
        console.log(map);
      }
    }

    // получение копии настроек кораблей для дальнейших манипуляций
    var shipsConfiguration = JSON.parse(
      JSON.stringify(this.shipsConfiguration)
    );
    var allShipsPlaced = false;
    while (allShipsPlaced === false) {
      var xPoint = this.getRandomInt(0, this.gameFieldBorderX.length);
      var yPoint = this.getRandomInt(0, this.gameFieldBorderY.length);
      if (this.isPointFree(map, xPoint, yPoint) === true) {
        if (
          this.canPutHorizontal(
            map,
            xPoint,
            yPoint,
            shipsConfiguration[0].pointCount,
            this.gameFieldBorderX.length
          )
        ) {
          for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
            map[yPoint][xPoint + i] = this.CELL_WITH_SHIP;
          }
        } else if (
          this.canPutVertical(
            map,
            xPoint,
            yPoint,
            shipsConfiguration[0].pointCount,
            this.gameFieldBorderY.length
          )
        ) {
          for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
            map[yPoint + i][xPoint] = this.CELL_WITH_SHIP;
          }
        } else {
          continue;
        }

        // обоновление настроек кораблей, если цикл не был пропущен
        // и корабль стало быть расставлен
        shipsConfiguration[0].maxShips--;
        if (shipsConfiguration[0].maxShips < 1) {
          shipsConfiguration.splice(0, 1);
        }
        if (shipsConfiguration.length === 0) {
          allShipsPlaced = true;
        }
      }
    }
    return map;
  },
// Получаем случайное значение 
  getRandomInt: function(min,max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
 
  // Проверяем координаты покругу, по часовой стрелке
  isPointFree: function() {
    if(
      map[yPoint][xPoint] ===this.CELL_EMPTY &&
      map[yPoint-1][xPoint] ===this.CELL_EMPTY &&
      map[yPoint-1][xPoint+1] ===this.CELL_EMPTY &&
      map[yPoint][xPoint+1] ===this.CELL_EMPTY &&
      map[yPoint+1][xPoint+1] ===this.CELL_EMPTY &&
      map[yPoint+1][xPoint] ===this.CELL_EMPTY &&
      map[yPoint+1][xPoint-1] ===this.CELL_EMPTY &&
      map[yPoint][xPoint-1] ===this.CELL_EMPTY &&
      map[yPoint-1][xPoint-1] ===this.CELL_EMPTY &&
      ) {
        return true
      }
      return false
  },
  canPutHorizontal: function (map, xPoint, yPoint, shipLength, coordLength) {
    var freePoints = 0;
    for (var x = xPoint; x < coordLength; x++) {
      // текущая и далее по часовй стрелке в гориз направл
      if (
        map[yPoint][x] === this.CELL_EMPTY &&
        map[yPoint - 1][x] === this.CELL_EMPTY &&
        map[yPoint - 1][x + 1] === this.CELL_EMPTY &&
        map[yPoint][x + 1] === this.CELL_EMPTY &&
        map[yPoint + 1][x + 1] === this.CELL_EMPTY &&
        map[yPoint + 1][x] === this.CELL_EMPTY
      ) {
        freePoints++;
      } else {
        break;
      }
    }
    return freePoints >= shipLength;
  },
  canPutVertical: function (map, xPoint, yPoint, shipLength, coordLength) {
    var freePoints = 0;
    for (var y = yPoint; y < coordLength; y++) {
      // текущая и далее по часовй стрелке в вертикальном направлении
      if (
        map[y][xPoint] === this.CELL_EMPTY &&
        map[y + 1][xPoint] === this.CELL_EMPTY &&
        map[y + 1][xPoint + 1] === this.CELL_EMPTY &&
        map[y + 1][xPoint] === this.CELL_EMPTY &&
        map[y][xPoint - 1] === this.CELL_EMPTY &&
        map[y - 1][xPoint - 1] === this.CELL_EMPTY
      ) {
        freePoints++;
      } else {
        break;
      }
    }
    return freePoints >= shipLength;
  },
  userFire: function (event) {
    if (this.isGameStopped() || this.isComputerGoes()) {
      return;
    }
    var e = event || window.event;
    var firedEl = e.target;
    var x = firedEl.getAttribute("data-x");
    var y = firedEl.getAttribute("data-y");
    if (this._computerShipsMap[y][x] === this.CELL_EMPTY) {
      firedEl.innerHTML = this.getFireFailTemplate();
      this.prepareToPcFire();
    } else {
      firedEl.innerHTML = this.getFireSuccessTemplate();
      firedEl.setAttribute("class", "ship");
      this._userHits++;
      this.updateToolbar();
      if (this._userHits >= this._hitsForWin) {
        this.stopGame();
      }
    }
    firedEl.onclick = null;
  },
  _computerGoes: false,
  isComputerGoes: function () {
    return this._computerGoes;
  },





};
