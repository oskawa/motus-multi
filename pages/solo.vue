<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="player-score">
          <h4>
            Joueur 1 :
            <span class="pointsPlayerOne">{{ totalPointsPlayerOne }}</span>
          </h4>
        </div>
        <div class="time-remain">
          <h1>{{ timer }}</h1>
        </div>
      </div>
    </div>

    <div id="grille" class="grille">
      <!-- <table>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table> -->
    </div>

    <div
      v-if="endGame"
      class="motus-modal fade"
      id="exampleModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
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
            Le mot a trouver était <strong>{{ wordToFindString }}</strong>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              v-on:click="winAndPlayAgain"
            >
              Recommencer
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="rules"
      class="motus-modal fade"
      id="exampleModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Choix des règles</h5>
          </div>
          <div class="modal-body">
            Veuillez choisir les règles s'il vous plait :
            <div class="input-div">
              <h5>Nombre de lettres :</h5>
              <input
                type="number"
                name="lettersNumber"
                v-model="lettersNumber"
                id=""
                value="5"
                placeholder="Nombre de lettres"
              />
            </div>
            <div class="input-div">
              <h5>Activation du chronomètre ?</h5>
              <input
                type="checkbox"
                name="timerActivation"
                id=""
                v-on:change="toggleTimer"
              />
            </div>
            <div class="input-div" v-if="timerActivation">
              <h5>Intervalle de temps</h5>
              <input
                type="number"
                name=""
                id=""
                value="10"
                v-model="timerDuration"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" v-on:click="playInit">
              Commencer !
            </button>
          </div>
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
      changeText: "",
      timer: 0,
      time: null,
      timerActivation: false,
      rules: true,
      lettersNumber: 5,
      timerDuration: 10,
      loosePoint: false,
    };
  },
  mounted() {
    const vm = this;
    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
    });

    vm.socket.on("functionTest", function () {
      console.log("un message est arrive ! ");
    });

    vm.socket.on("tick", (tickId) => {
      vm.latestTickId = tickId;
    });

    document.addEventListener("keypress", (e) => {
      if (
        String.fromCharCode(e.keyCode).match(/(\w|\s)/g) &&
        e.key !== "Enter"
      ) {
        this.proposition(vm, this.nombreDessais, e.key);
      }
      if (e.key === "Enter") {
        if (this.Grille._propositions.length == this.Grille._longueurMot) {
          this.compareWords();
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        this.removeLetter(this.nombreDessais);
      }
    });
  },
  methods: {
    tableCreate(tdNumber, trNumber) {
      const body = document.body,
        tbl = document.createElement("table");
      
      for (let i = 0; i < trNumber; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < tdNumber; j++) {
        
            const td = tr.insertCell();
                      
            
          
        }
      }
      document.getElementById('grille').appendChild(tbl);
    },
    playInit() {
      this.Grille = new Grille(
        this.lettersNumber,
        6,
        this.wordToFindString.charAt(0)
      );
      this.tableCreate(this.Grille._longueurMot, 6)

      this.rules = false;
      this.getRandomWord();
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
          console.log("stoppe");
          clearInterval(this.time);
          this.compareWords();
        }
      }, 1000);
    },

    getRandomWord() {
      this.Grille._indice = [];
      let letter = this.lettersNumber;

      var generateWord = words.filter((word) => word.length == letter);
      console.log(generateWord);

      generateWord = generateWord[this.getRandomInt(generateWord.length - 1)];

      generateWord = generateWord
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      this.wordToFindString = generateWord;
      console.log(this.wordToFindString);

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

          console.log("oui");
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
        this.win();
      } else {
        this.nombreDessais++;
        if (this.nombreDessais > this.Grille._maxPropositions) {
          this.loseAndRetry();
          this.loosePoint = true;
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
    win() {
      this.endGame = true;
      this.changeText = "Bien joué ! Vous avez trouvé le mot !";
    },
    loseAndRetry() {
      this.endGame = true;
      this.changeText = "Vous avez perdu ! Réessayez.";
      this.totalPointsPlayerOne = 0;
    },
    winAndPlayAgain() {
      if (!this.loosePoint) {
        this.totalPointsPlayerOne = this.totalPointsPlayerOne + 50;
      }
      this.endGame = false;

      this.Grille._propositions = [];
      this.nombreDessais = 1;

      var tdDiv = document.querySelectorAll("td");
      for (let i = 0; i < tdDiv.length; ++i) {
        tdDiv[i].removeAttribute("class");
        tdDiv[i].innerHTML = "";
      }
      this.getRandomWord();
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
body {
  background-color: rgb(43, 43, 43);
}
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
#grille {
  margin-left: auto;
  margin-right: auto;
  background-color: #0077c7;
  min-height: 300;
}
#grille table {
  border-spacing: 0;
  background: #0077c7;
}
#grille td {
  width: 50px;
  height: 50px;
  text-align: center;
  position: relative;
  padding: 2px;
  color: white;
  border: 1px solid white;
  z-index: 0;
  text-transform: uppercase;
  font-family: "Darker Grotesque";
  font-weight: 600;
  font-size: 20px;
}
.existAndPlacement {
  transition: all 200ms;
}
.existAndPlacement:after {
  background: #e7002a;
  width: 49px;
  height: 49px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  content: " ";
  transition: all 200ms;
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
}
.notExist {
}
.motus-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;

  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
  opacity: 1 !important;
}
.player-score {
  color: white;
}
</style>
