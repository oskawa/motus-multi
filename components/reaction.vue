
<template>
  <div class="particlesContainer" id="particlesContainer">
    <span class="particle"> </span>
  </div>
</template>

<script>


export default {
  data() {
    return {};
  },
  mounted() {
    $(document).ready( () => {
  $(".particle")
    .toArray()
    .forEach((particle) => {
      $(particle).animate(
        {
          left: this.getRndInteger(0, $("body").width()),
          right: this.getRndInteger(0, $("body").width()),
        },
        this.getRndInteger(10, 30),
        function () {
          $(particle).animate(
            {
              top: -100 + "%",
              opacity: 0,
            },
            this.getRndInteger(5000, 8000),
            function () {
              $(particle).remove();
            }
          );
        }
      );
    });
});

    let interval;
    var fbReactions = ["like", "love", "happy", "wow", "sad", "angry"];
    let particlesContainer = document.getElementById("particlesContainer");
    window.addEventListener("focus", () => {
      interval = setInterval(() => {
        particlesContainer.appendChild(this.createSpan(fbReactions[0]));
      }, this.getRndInteger(400, 600));
    });
    window.addEventListener("blur", () => {
      clearInterval(interval);
    });
  },
  methods: {
    getRndInteger(a, b) {
      return Math.floor(Math.random() * (a - b + 1)) + a;
    },
    createSpan(name) {
      let span = document.createElement("span");
      span.classList.add("particle");
      span.classList.add(name);
      return span;
    },
  },
};
</script>

<style scoped>
:root {
  --background: #f7f9f9;
  --white: #ffff;
  --blue: #548cff;
}

.particlesContainer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.particle {
  display: inline-flex;
  position: absolute;
  height: 5rem;
  width: 5rem;
  left: 0;
  right: 0;
  top: 10%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  margin: auto;
  background-position: url("/emoji.png");
  border-radius: 500px;
}
.particle.like {
  background-position: 8px 8px;
}
.particle.love {
  background-position: -75px 8px;
}
.particle.happy {
  background-position: -158px 8px;
}
.particle.wow {
  background-position: -241px 8px;
}
.particle.sad {
  background-position: -324px 8px;
}
.particle.angry {
  background-position: -407px 8px;
}
</style>
