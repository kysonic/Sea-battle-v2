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

    this.drawCamePoints();
    this.updateToolbar();
  },
};
