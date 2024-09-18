<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // Prop to receive the active tab from the parent
  export let activeTab: "clipboard" | "collections";
</script>

<nav>
  <img src="" alt="Logo" />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <ul>
    <li
      class:active={activeTab === "clipboard"}
      on:click={() => dispatch("tabChange", "clipboard")}
    >
      Clipboard
    </li>
    <li
      class:active={activeTab === "collections"}
      on:click={() => dispatch("tabChange", "collections")}
    >
      Collections
    </li>
    <!-- <li>Settings</li> -->
  </ul>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(51, 51, 51, 0.5);
    color: white;
    height: 80px;
    width:280px;
    padding: 0 10px;
    position: sticky;
    top: 0;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  ul {
    display: flex;
    gap: 5px;
  }

  li {
    list-style: none;
    width: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
  }

  li:hover {
    color: #2c58e9;
  }

  .active {
    color: green;
  }
</style>
