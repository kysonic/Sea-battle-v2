(function (root, factory) {
  root.SeaBattle = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function SeaBattle(gameAreaId) {
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
    this.hitsForWin = 0;

    for (let i = 0; i < this.shipsConfiguration.length; i++) {
      this.hitsForWin =
        +this.hitsForWin +
        this.shipsConfiguration[i].maxShips *
          this.shipsConfiguration[i].pointCount;
    }
    //  Карты кораблей для Игрока и компьютера
    this.computerShipsMap = null;
    this.userShipsMap = null;

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

  SeaBattle.prototype = {
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
      this.startGameButton.onclick = function () {
        this.startNewGame();
      }.bind(this);
      footer.appendChild(this.startGameButton);
      this.gameArea.appendChild(footer);
    },
    startNewGame: function () {
      this.userName = this.userName || prompt("Enter your name", "Viktor");
      this.computerName = this.computerName;

      if (!this.userName) {
        alert("Wrong name");
        return;
      }
      this.startGameButton.innerHTML = "Start over";
      this.computerInfo.innerHTML = this.computerName + " (ваш противник)";
      this.userInfo.innerHTML = this.userName + " (ваше поле)";

      this.computerShipsMap = this.generateRandomShipMap();
      this.userShipsMap = this.generateRandomShipMap();
      this.computerShotMap = this.generateShotMap();

      this.userHits = 0;
      this.computerHits = 0;
      this.blockHeight = null;
      this.gameStopped = false;
      this.computerGoes = false;

      this.drawGamePoints();
      this.updateToolbar();
    },

    drawGamePoints: function () {
      for (let yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
        for (let xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
          let computerPointBlock = this.getOrCreatePointBlock(yPoint, xPoint);
          computerPointBlock.onclick = function (e) {
            this.userFire(e);
          }.bind(this);

          let userPointBlock = this.getOrCreatePointBlock(
            yPoint,
            xPoint,
            "user"
          );
          if (this.userShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP) {
            userPointBlock.setAttribute("class", "ship");
          }
        }
      }
    },
  

    getOrCreatePointBlock: function (yPoint, xPoint, type) {
      let id = this.getPointBlockIdByCoords(yPoint, xPoint, type);
      let block = document.getElementById(id);
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
          this.computerGameField.appendChild(block);
        }
      }
      block.style.width = 100 / this.gameFieldBorderY.length + "%";
      if (!this.blockHeight) {
        this.blockHeight = block.clientWidth;
      }
      block.style.height = this.blockHeight + "px";
      block.style.lineHeight = this.blockHeight + "px";
      block.style.fontSize = this.blockHeight + "px";
      return block;
    },

    // Возвращает ID ячейки используя координаты
    getPointBlockIdByCoords: function (yPoint, xPoint, type) {
      if (type && type === "user") {
        return "user_x" + xPoint + "_y" + yPoint;
      }
      return "pc_x" + xPoint + "_y" + yPoint;
    },

    // Создание массива для будущего обстрела
    generateShotMap: function () {
      let map = [];
      for (let yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
        for (let xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
          map.push({ y: yPoint, x: xPoint });
        }
      }
      return map;
    },

    //  Массив содержащий информацию есть ли корабль в ячейке
    generateRandomShipMap: function () {
      let map = [];
      // генерация карты расположения, вклчающей отрицательный координаты
      // для возможности размещения у границ
      for (
        let yPoint = -1;
        yPoint < this.gameFieldBorderY.length + 1;
        yPoint++
      ) {
        for (
          let xPoint = -1;
          xPoint < this.gameFieldBorderX.length + 1;
          xPoint++
        ) {
          if (!map[yPoint]) {
            map[yPoint] = [];
          }
          map[yPoint][xPoint] = this.CELL_EMPTY;
        }
      }

      // получение копии настроек кораблей для дальнейших манипуляций
      let shipsConfiguration = JSON.parse(
        JSON.stringify(this.shipsConfiguration)
      );
      let allShipsPlaced = false;
      while (allShipsPlaced === false) {
        let xPoint = this.getRandomInt(0, this.gameFieldBorderX.length);
        let yPoint = this.getRandomInt(0, this.gameFieldBorderY.length);
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
            for (let i = 0; i < shipsConfiguration[0].pointCount; i++) {
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
            for (let i = 0; i < shipsConfiguration[0].pointCount; i++) {
              map[yPoint + i][xPoint] = this.CELL_WITH_SHIP;
            }
          } else {
            continue;
          }

          // Если корабль встал на карту
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
    getRandomInt: function (min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    // Проверяем координаты покругу, по часовой стрелке
    isPointFree: function (map, xPoint, yPoint) {
      if (
        map[yPoint][xPoint] === this.CELL_EMPTY &&
        map[yPoint - 1][xPoint] === this.CELL_EMPTY &&
        map[yPoint - 1][xPoint + 1] === this.CELL_EMPTY &&
        map[yPoint][xPoint + 1] === this.CELL_EMPTY &&
        map[yPoint + 1][xPoint + 1] === this.CELL_EMPTY &&
        map[yPoint + 1][xPoint] === this.CELL_EMPTY &&
        map[yPoint + 1][xPoint - 1] === this.CELL_EMPTY &&
        map[yPoint][xPoint - 1] === this.CELL_EMPTY &&
        map[yPoint - 1][xPoint - 1] === this.CELL_EMPTY
      ) {
        return true;
      }
      return false;
    },
    canPutHorizontal: function (map, xPoint, yPoint, shipLength, coordLength) {
      let freePoints = 0;
      for (let x = xPoint; x < coordLength; x++) {
        // Проверяем координаты покругу, по часовой стрелке
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
      let freePoints = 0;
      for (let y = yPoint; y < coordLength; y++) {
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
      let e = event || window.event;
      let firedEl = e.target;
      let x = firedEl.getAttribute("data-x");
      let y = firedEl.getAttribute("data-y");
      if (this.computerShipsMap[y][x] === this.CELL_EMPTY) {
        firedEl.innerHTML = this.getFireFailTemplate();
        this.prepareToComputerFire();
      } else {
        firedEl.innerHTML = this.getFireSuccessTemplate();
        firedEl.setAttribute("class", "ship");
        this.userHits++;
        this.updateToolbar();
        if (this.userHits >= this.hitsForWin) {
          this.stopGame();
        }
      }
      firedEl.onclick = null;
    },
    computerGoes: false,
    isComputerGoes: function () {
      return this.computerGoes;
    },
    prepareToComputerFire: function () {
      this.computerGoes = true;
      this.updateToolbar();
      setTimeout(
        function () {
          this.computerFire();
        }.bind(this),
        this.computerDelay
      );
    },
    computerFire: function () {
      if (this.isGameStopped()) {
        return;
      }
      // Рандомный выстрел на основе карты
      let randomShotIndex = this.getRandomInt(0, this.computerShotMap.length);
      let randomShot = JSON.parse(
        JSON.stringify(this.computerShotMap[randomShotIndex])
      );

      this.computerShotMap.splice(randomShotIndex, 1);

      let firedEl = document.getElementById(
        this.getPointBlockIdByCoords(randomShot.y, randomShot.x, "user")
      );
      if (this.userShipsMap[randomShot.y][randomShot.x] === this.CELL_EMPTY) {
        firedEl.innerHTML = this.getFireFailTemplate();
      } else {
        firedEl.innerHTML = this.getFireSuccessTemplate();
        this.computerHits++;
        this.updateToolbar();
        if (this.computerHits >= this.hitsForWin) {
          this.stopGame();
        } else {
          this.prepareToComputerFire();
        }
      }
      this.computerGoes = false;
      this.updateToolbar();
    },
    stopGame: function () {
      this.gameStopped = true;
      this.computerGoes = false;
      this.startGameButton.innerHTML = "Play again?";
      this.updateToolbar();
    },
    isGameStopped: function () {
      return this.gameStopped;
    },
    getFireSuccessTemplate: function () {
      return "X";
    },
    getFireFailTemplate: function () {
      return "&#183;";
    },
    updateToolbar: function () {
      this.toolbar.innerHTML =
        "Счет - " + this.computerHits + ":" + this.userHits;
      if (this.isGameStopped()) {
        if (this.userHits >= this.hitsForWin) {
          this.toolbar.innerHTML += ", вы победили";
        } else {
          this.toolbar.innerHTML += ", победил ваш противник";
        }
      } else if (this.isComputerGoes()) {
        this.toolbar.innerHTML += ", ходит ваш противник";
      } else {
        this.toolbar.innerHTML += ", сейчас ваш ход";
      }
    },
    updateToolbar: function () {
      this.toolbar.innerHTML =
        "Счет - " + this.computerHits + ":" + this.userHits;
      if (this.isGameStopped()) {
        if (this.userHits >= this.hitsForWin) {
          this.toolbar.innerHTML += ", вы победили";
        } else {
          this.toolbar.innerHTML += ", победил ваш противник";
        }
      } else if (this.isComputerGoes()) {
        this.toolbar.innerHTML += ", ходит ваш противник";
      } else {
        this.toolbar.innerHTML += ", сейчас ваш ход";
      }
    },
  };
  return SeaBattle;
});
