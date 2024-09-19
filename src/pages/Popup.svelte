<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import RecordList from "../components/RecordList.svelte";
  import Collections from "../components/Collections.svelte";

  type Tab = "clipboard" | "collections";
  let activeTab: Tab = "clipboard";

  function handleTabChange(event: CustomEvent<Tab>) {
    const tab = event.detail;
    activeTab = tab;
  }
  
</script>

<main>
  <Navbar {activeTab} on:tabChange={handleTabChange} />
  <div class="tab-content">
    <div class:active={activeTab === "clipboard"}>
      <RecordList />
    </div>
    <div class:active={activeTab === "collections"}>
      <Collections />
    </div>
  </div>
</main>

<style>
  .tab-content > div {
    display: none;
  }

  .tab-content > div.active {
    display: block;
  }
</style>
