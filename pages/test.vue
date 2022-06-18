<template>
  <div class="container section-app">
    <div class="row row-timer">
      <div class="col-2">
        <div class="timer-container">
          <div class="timer-content">
            <span class="timer-modif">30</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row row-app">
      <div class="col-2">
        <div class="name-player name-player-one"><h3>Player 1</h3></div>
        <div class="individual-score player-one">
          <span>{{ totalPointsPlayerOne }}</span>
        </div>
      </div>

      <div class="col-6">
        <div class="grid-container">
          <div id="grille" class="grille">
            <div v-if="endGame" class="motus-pop" id="exampleModal">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    {{ changeText }}
                  </h5>
                  <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  Le mot a trouver était
                  <strong>{{ wordToFindString }}</strong>
                </div>
                <div class="modal-footer">
                  <button
                  v-if="winRound"
                  
                    type="button"
                    class="btn btn-primary"
                    v-on:click="gameContinue"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="chooseSettings"
              class="motus-rules fade"
              id="exampleModal"
            >
              <div class="">
                <h5 class="modal-title" id="exampleModalLabel">
                  Règlages du jeu :
                </h5>

                <p>
                  Afin de personnaliser au mieux votre expérience de jeu
                  multi-joueur, vous pouvez modifier quelques paramètres.
                </p>
                <div class="input-div">
                  <h6>Nombre de lettres :</h6>

                  <input
                    type="number"
                    name="lettersNumber"
                    v-model="lettersNumber"
                    class="input-number__custom"
                    id=""
                    value="6"
                    min="6"
                    max="10"
                    placeholder="Nombre de lettres"
                  />
                </div>

                <div class="input-div">
                  <h6>Activation du chronomètre ?</h6>
                  <input
                    type="checkbox"
                    name="timerActivation"
                    id=""
                    v-on:change="toggleTimer"
                  />
                </div>
                <div class="input-div" v-if="timerActivation">
                  <h6>Temps du chronomètre</h6>
                  <input
                    type="number"
                    name=""
                    id=""
                    value="10"
                    v-model="timerDuration"
                  />
                </div>

                <button type="button" class="btn-fill" v-on:click="playInit">
                  Commencer !
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-2">
        <div class="name-player name-player-two"><h3>Player 2</h3></div>
        <div class="individual-score player-two">
          <span>{{ totalPointsPlayerTwo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var words = require("an-array-of-french-words");
class Grille {
  constructor(longueurMot, maxPropositions, indice) {
    this._grille = document.getElementById("grille");
    this._longueurMot = longueurMot;
    this._maxPropositions = maxPropositions;
    this._indice = new Array(longueurMot);
    this._indice[0] = indice;
    this._propositions = new Array();
    this._resultats = new Array();
    this._motActuel = 0;
  }
}

export default {
  data() {
    return {
      latestTickId: 0,
      Grille: null,
      wordToFindString: "",
      nombreDessais: 1,
      endGame: false,
      totalPointsPlayerOne: 0,
      totalPointsPlayerTwo: 0,
      winRound : false,
      changeText: "",
      timer: 0,
      time: null,
      timerActivation: false,
      rules: true,
      lettersNumber: 5,
      timerDuration: 10,
      loosePoint: false,
      uuid: null,
      chooseSettings: true,
      userNumber: 0,
      turnToPlay: false,
      opponentAlreadyLoose: false,
      looseRound: false,
    };
  },
  created() {
    this.uuidd = this.$nuxt._route.query.multiID;
  },
  mounted() {
    const vm = this;
    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
    });
    vm.socket.emit("join", this.uuid);

    vm.socket.on("functionTest", function () {});

    vm.socket.on("playerConnected", function () {});

    vm.socket.on("waitingPlayer", (numberOfUser) => {
      if (numberOfUser == 1) {
        this.userNumber = 1;
        this.chooseSettings = true;
        this.turnToPlay = true;
      } else if (numberOfUser == 2) {
        this.chooseSettings = false;
        this.userNumber = 2;
        this.turnToPlay = false;
      } else {
        this.userNumber = 3;
      }
      console.log(this.userNumber);
    });

    vm.socket.on("createTable", (table, wordToFindString) => {
      this.wordToFindString = wordToFindString;
      console.log(table._longueurMot);

      this.Grille = new Grille(
        table._longueurMot,
        6,
        this.wordToFindString.charAt(0)
      );
      this.tableCreate(table._longueurMot, table._maxPropositions);
      this.placeIndice();
    });

    vm.socket.on("propOpponent", (propOpponent, tryNumber) => {
      this.fillOpponent(propOpponent, tryNumber);
      this.Grille._propositions = propOpponent;
      this.compareWords();
    });

    vm.socket.on("newRound", (wordToFind, lastWinner) => {
      console.log("on commence un nouveau round");
      this.endGame = false;
      this.Grille._propositions = [];
      this.nombreDessais = 1;
      this.Grille._indice = [];

      var tdDiv = document.querySelectorAll("td");
      for (let i = 0; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }

      this.wordToFindString = wordToFind;

      if (this.userNumber == 1 || this.userNumber == 2) {
       
        if(lastWinner == this.winRound){
            this.turnToPlay = true;
            this.opponentAlreadyLoose = false;
             this.looseRound = false;
        }else{
          console.log('on ne joue pas')
           this.turnToPlay = false;
            this.opponentAlreadyLoose = false;
             this.looseRound = false;
        }
      }
      this.placeIndice();
    });

    vm.socket.on("opponentLooseTurnToPlay", (userId) => {
     
      console.log(this.userNumber);
      console.log(userId);
      if (this.userNumber == userId) {
        this.turnToPlay = false;
      } else {
        console.log(this.userNumber);
        console.log("wtf");
        this.opponentAlreadyLoose = true;
        this.turnToPlay = true;
      }

      var tdDiv = document.querySelectorAll("td");
      for (let i = 20; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }
      this.nombreDessais = 5;
      for (let i = 0; i < this.Grille._indice.length; i++) {
        if (this.Grille._indice[i] != null) {
          var positionIndice = i + 1;
          document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionIndice +
              ")"
          ).innerHTML = this.Grille._indice[i];
        }
      }
    });

vm.socket.on('addPointToPlayer', (userId) =>{

  this.addPointToPlayer(userId)
})


    document.addEventListener("keypress", (e) => {
      if (this.turnToPlay) {
        if (
          String.fromCharCode(e.keyCode).match(/(\w|\s)/g) &&
          e.key !== "Enter"
        ) {
          this.proposition(vm, this.nombreDessais, e.key);
        }
        if (e.key === "Enter") {
          if (this.Grille._propositions.length == this.Grille._longueurMot) {
            vm.socket.emit(
              "wordProposition",
              this.uuid,
              this.Grille._propositions,
              this.nombreDessais
            );
            this.compareWords();
          }
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (this.turnToPlay) {
        if (e.key === "Backspace") {
          this.removeLetter(this.nombreDessais);
        }
      }
    });
  },
  methods: {
    fillOpponent(prop, tryNumber) {
      for (let index = 0; index < prop.length; index++) {
        const element = prop[index];
        let nthChild = index + 1;
        var line = document.querySelector(
          "tr:nth-child(" + tryNumber + ") td:nth-child(" + nthChild + ")"
        );

        line.innerHTML = element;
      }
    },
    tableCreate(tdNumber, trNumber) {
      const body = document.body,
        tbl = document.createElement("table");

      for (let i = 0; i < trNumber; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < tdNumber; j++) {
          const td = tr.insertCell();
        }
      }
      document.getElementById("grille").appendChild(tbl);
    },
    playInit() {
      const vm = this;

      this.Grille = new Grille(
        this.lettersNumber,
        6,
        this.wordToFindString.charAt(0)
      );
      this.getRandomWord();

      vm.socket.emit(
        "tableChoose",
        this.Grille,
        this.uuid,
        this.wordToFindString
      );
      this.tableCreate(this.Grille._longueurMot, 6);
      this.placeIndice();

      this.chooseSettings = false;

      if (this.timerActivation) {
        this.showTimer();
      }
    },
    toggleTimer() {
      this.timerActivation = !this.timerActivation;
    },
    showTimer() {
      this.time = setInterval(() => {
        this.timer = this.timer + 1;

        if (this.timer > this.timerDuration) {
          clearInterval(this.time);
          this.compareWords();
        }
      }, 1000);
    },

    getRandomWord() {
      let letter = this.lettersNumber;

      var generateWord = words.filter((word) => word.length == letter);

      generateWord = generateWord[this.getRandomInt(generateWord.length - 1)];

      generateWord = generateWord
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      this.wordToFindString = generateWord;
      console.log(this.wordToFindString);
    },
    placeIndice() {
      console.log(this.userNumber);
      console.log(this.wordToFindString);
      this.Grille._indice = [];
      this.Grille._indice[0] = Array.from(this.wordToFindString)[0];
      document.querySelector("tr:nth-child(1) td:nth-child(1)").innerHTML =
        this.Grille._indice[0];
    },
    getRandomInt(max) {
      return Math.floor(Math.random() * max);
    },
    removeLetter(LineNumber) {
      if (this.Grille._propositions.length > 0) {
        var numberArrayWord = this.Grille._propositions.length;
        var line = document.querySelector(
          "tr:nth-child(" +
            LineNumber +
            ") td:nth-child(" +
            numberArrayWord +
            ")"
        );

        line.innerHTML = "";
        this.Grille._propositions.pop();
      }
    },
    proposition(vm, LineNumber, keyPressed) {
      console.log(this.Grille._propositions.length);
      console.log(this.Grille._longueurMot);
      if (this.Grille._propositions.length < this.Grille._longueurMot) {
        this.Grille._propositions.push(keyPressed.toUpperCase());

        var numberArrayWord = this.Grille._propositions.length;

        var line = document.querySelector(
          "tr:nth-child(" +
            LineNumber +
            ") td:nth-child(" +
            numberArrayWord +
            ")"
        );

        line.innerHTML = this.Grille._propositions[numberArrayWord - 1];
      }
    },

    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (var i = arr1.length; i--; ) {
        if (arr1[i] !== arr2[i]) return false;
      }

      return true;
    },
    compareWords() {
      console.log("compare word id user : " + this.userNumber);
      var word = this.wordToFindArray(this.wordToFindString.toUpperCase());
      for (let i = 0; i < this.Grille._propositions.length; i++) {
        var positionWord = i + 1;
        var animationSecond =
          10 / this.wordToFindArray(this.wordToFindString).length;

        if (this.Grille._propositions[i] == word[i]) {
          var thToFill = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );

          thToFill.classList.add("existAndPlacement");

          animationSecond = animationSecond + 2;
          this.Grille._indice[i] = this.Grille._propositions[i];
        } else if (word.includes(this.Grille._propositions[i])) {
          var thToFill = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );

          thToFill.classList.add("exist");

          animationSecond = animationSecond + 2;
        } else {
          var thToFill = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );

          thToFill.classList.add("notExist");

          animationSecond = animationSecond + 2;
        }
      }

      if (this.arraysEqual(this.Grille._propositions, word) == true) {
        if ((this.turnToPlay == true)) {
          this.win();
        } else {
          this.opponentWinRound();
        }
      } else {
        this.nombreDessais++;
        if (this.nombreDessais > this.Grille._maxPropositions) {
          if (!this.opponentAlreadyLoose) {
            if (this.turnToPlay) {
              console.log("cest perdu :" + this.userNumber);
              this.loseAndRetry();
            }
          } else {
            this.endGame = true;
            this.loosePoint = true;
            setTimeout(() => {
              this.changeWord();
            }, 5000);
          }
        } else if (this.Grille._indice) {
          if (this.timerActivation) {
            this.timer = 0;
            clearInterval(this.time);

            this.showTimer();
          }
          for (let i = 0; i < this.Grille._indice.length; i++) {
            if (this.Grille._indice[i] != null) {
              var positionIndice = i + 1;
              document.querySelector(
                "tr:nth-child(" +
                  this.nombreDessais +
                  ") td:nth-child(" +
                  positionIndice +
                  ")"
              ).innerHTML = this.Grille._indice[i];
            }
          }
        }
      }

      this.Grille._propositions = [];
    },
    changeWord() {
      const vm = this;
      this.endGame = false;
      this.loosePoint = false;
      this.Grille._propositions = [];
      this.nombreDessais = 1;

      var tdDiv = document.querySelectorAll("td");
      for (let i = 0; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }
      this.getRandomWord();
      vm.socket.emit("newWord", this.uuid, this.wordToFindString, this.winRound);
    },

    opponentWinRound() {
      this.endGame = true;
      this.changeText = "Votre adversaire a trouvé le mot";
    },
    win() {
     
      const vm = this;
      this.endGame = true;
      this.winRound = true
      this.changeText = "Bien joué ! Vous avez trouvé le mot !";
      this.addPointToPlayer(this.userNumber);
      vm.socket.emit("winner", this.uuid, this.userNumber, this.winRound);
    },


    addPointToPlayer(userNumber) {
      console.log("L'utilisateur" + userNumber + " a gagné")
      if ((userNumber == 1)) {
        this.totalPointsPlayerOne = this.totalPointsPlayerOne + 50;
      } else {
        this.totalPointsPlayerTwo = this.totalPointsPlayerTwo + 50;
      }
    },

    loseAndRetry() {
      console.log("Mon ID : " + this.userNumber);
      this.looseRound = true;
      this.turnToPlay = false;
      this.winRound = false
      var tdDiv = document.querySelectorAll("td");
      for (let i = 20; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }
      this.nombreDessais = 5;
      for (let i = 0; i < this.Grille._indice.length; i++) {
        if (this.Grille._indice[i] != null) {
          var positionIndice = i + 1;
          document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionIndice +
              ")"
          ).innerHTML = this.Grille._indice[i];
        }
      }
      const vm = this;
      console.log("Mon ID : " + this.userNumber);
      vm.socket.emit(
        "looseOpponentToPlay",
        this.uuid,
        this.userNumber,
        this.wordToFindString
      );

      this.changeText = "Vous avez perdu ! Réessayez.";
    },

    gameContinue() {
      const vm = this;

      this.endGame = false;

      this.Grille._propositions = [];
      this.nombreDessais = 1;

      var tdDiv = document.querySelectorAll("td");
      for (let i = 0; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }
      this.getRandomWord();
      this.turnToPlay = false;

      vm.socket.emit("newWord", this.uuid, this.wordToFindString, this.winRound);
    },


    wordToFindArray(wordToFind) {
      const usingSplit = wordToFind.split("");
      const usingSpread = [...wordToFind];
      const usingArrayFrom = Array.from(wordToFind);
      const usingObjectAssign = Object.assign([], wordToFind);
      return usingObjectAssign;
    },
  },
};
</script>

<style>
:root {
  --cellsNumber: 6;
}
body {
  height: 100vh;
  background: linear-gradient(180deg, #3cb396 0%, #000c78 100%);
}
.section-app {
  height: 100vh;
  padding-top: 8rem;
}
.section-app .row-app {
  height: auto;
  justify-content: center;
  align-items: end;
}
.row-timer {
  justify-content: center;
}
.individual-score {
  width: 100%;
  height: 76px;

  box-shadow: 0px 0px 6px 2px rgba(251, 251, 251, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.individual-score span {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 800;
  font-size: 50px;
  line-height: 59px;
  /* identical to box height */

  color: #ffffff;
}
.player-one {
  background: #c6c94f;
}
.player-two {
  background: #d14c4c;
}
#grille {
  margin-left: auto;
  margin-right: auto;
  background-color: #0077c7;
  min-height: 300;
  height: 540px;
  position: relative;
}
#grille table {
  border-spacing: 0;
  width: 100%;
  background: #0077c7;
  height: 100%;
  box-shadow: inset 0px 10px 11px 1px rgba(0, 0, 0, 0.25);
}
#grille td {
  --var: calc(100% - var(--cellsNumber));
  min-width: var(--var);
  max-width: var(--var);

  width: 50px;
  height: var(--var);

  text-align: center;
  position: relative;
  padding: 2px;
  color: white;
  border: 1px solid white;
  z-index: 0;
  text-transform: uppercase;

  line-height: 0;

  font-family: "Raleway";
  font-style: normal;
  font-weight: 800;
  font-size: 50px;
  color: #ffffff;
}

.name-player {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 800;
  font-size: 25px;
  line-height: 29px;
  color: #ffffff;
  text-align: center;
}
.timer-content {
  background: #2f2834;
  box-shadow: 0px 0px 6px 2px rgba(251, 251, 251, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
}
.timer-container {
  margin-bottom: 1rem;
}
.timer-content span {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 800;
  font-size: 40px;

  color: #ffffff;
}
.existAndPlacement {
  transition: all 200ms;
}
.existAndPlacement:after {
  background: #e7002a;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  content: " ";
  transition: all 200ms;
  /* Rectangle 12 */

  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.exist {
  background: #ffbd00;
  border-radius: 50%;
  width: 49px;
  height: 49px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  content: " ";
  transition: all 200ms;

  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.notExist {
}
.motus-rules {
  position: absolute;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
  right: 0;
  bottom: 0;
  left: 0;
  top: 0;
  overflow: hidden;
  outline: 0;
  opacity: 1 !important;
  padding: 5rem;
}
.motus-rules h5 {
  color: white;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 800;
  font-size: 30px;
}
.motus-rules p {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;

  color: #ffffff;
  margin: 1rem 0;
}
.motus-rules h6 {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
}
.motus-rules .input-div {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.motus-pop {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  right: 0;
  bottom: 0;
  left: 0;
  top: 0;
  overflow: hidden;
  outline: 0;
  z-index: 1;
}
.input-number__custom {
}
.btn-fill {
  background: #3cb396;
  border-radius: 38px;
  width: 100%;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 23px;
  text-align: center;
  padding: 0.5rem;
  color: #ffffff;
  border: none;
}
</style>
