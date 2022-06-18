
<template>
  <section class="first-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h1 class="title">MOTUS</h1>
          <NuxtLink class="link-btn" to="/solo">Mode solo</NuxtLink>
          <NuxtLink
            class="link-btn"
            :to="{ path: 'test', query: { multiID } }"
            >Mode Multi-joueur</NuxtLink
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
export default {
  data() {
    return {
      multiID: uuidv4(),
    };
  },
  mounted() {
    console.log(uuidv4());
    console.log(this.multiID);
  },
};
</script>

<style>
body {
  background-color: rgb(43, 43, 43);
}
.first-section {
  height: 100vh;
}
.container,
.row {
  height: 100%;
}
.row {
  justify-content: center;
  align-items: center;
  text-align: center;
}
.link-btn {
  color: white;
  font-weight: 800;
  font-size: 32px;
  padding: 1rem;
  text-transform: uppercase;
  display: block;
}
.title {
  font-size: 50px;
  color: white;
}
</style>

