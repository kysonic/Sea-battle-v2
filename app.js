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
