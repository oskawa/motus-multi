<template>
  <div class="container">
    <div id="grille" class="grille">
      <table>
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
      </table>
    </div>
  </div>
</template>

<script>
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
      wordToFindString: "abric",
      nombreDessais: 1,
    };
  },
  mounted() {
    this.Grille = new Grille(5, 6, this.wordToFindString.charAt(0));
    console.log(this.wordToFindString);
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
      if (String.fromCharCode(e.keyCode).match(/(\w|\s)/g)) {
        this.proposition(vm, this.nombreDessais, e.key);
      }
      if (e.key === "Enter") {
        if (this.Grille._propositions.length == this.Grille._longueurMot) {
          this.compareWords();
        }
      }
    });
  },
  methods: {
    proposition(vm, LineNumber, keyPressed) {
     
      if (this.Grille._propositions.length < this.Grille._longueurMot) {
        this.Grille._propositions.push(keyPressed);
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
      var word = this.wordToFindArray(this.wordToFindString);

      for (let i = 0; i < this.Grille._propositions.length; i++) {
        var positionWord = i + 1;
        if (this.Grille._propositions[i] == word[i]) {
          var line2 = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );
          line2.classList.add("existAndPlacement");
          this.Grille._indice[i] = this.Grille._propositions[i];
        } else if (word.includes(this.Grille._propositions[i])) {
          var line2 = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );
          line2.classList.add("exist");
        } else {
          var line2 = document.querySelector(
            "tr:nth-child(" +
              this.nombreDessais +
              ") td:nth-child(" +
              positionWord +
              ")"
          );
          line2.classList.add("notExist");
        }
      }



      if (this.arraysEqual(this.Grille._propositions, word) == true) {
        console.log("Bien joué !");
      } else {
      }
      this.nombreDessais++;
      console.log(this.Grille._indice)
      if (this.Grille._indice){
        for (let i = 0; i < this.Grille._indice.length; i++) {
          if (this.Grille._indice[i] != null){
            var positionIndice = i + 1;
            document.querySelector("tr:nth-child(" +this.nombreDessais +  ") td:nth-child(" + positionIndice +")").innerHTML = this.Grille._indice[i]
          
          }          
        }

      }
      const vm = this;
      this.Grille._propositions = [];
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
}
.notExist {
  
}
</style>
