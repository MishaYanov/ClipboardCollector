<script lang="ts">
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";
  import CollectionInstance from "./collections/CollectionInstance.svelte";
  import CreateCollection from "./collections/CreateCollection.svelte";

  type Tab = "active" | "new" | "all";

  let collections: any | null = null;
  // collection manager state
  let activeTab: Tab = "all";
  let activeCollection: any | null = null;
  let isCreatingCollection = false;
  let isShowingAllCollections = false;

  const ps = PortService.getInstance(PortName.POPUP);
  //get all collections
  ps.sendMessage({ type: PopupToBackGroundMessageType.GET_ALL_COLLECTIONS });
  ps.onMessage((message) => {
    if (message.type === PopupToBackGroundMessageType.GET_ALL_COLLECTIONS) {
      console.log(message);
      collections = message.collections;
    }
  });
  //create new collection
  const createCollection = () => {};
  const showAllCollections = () => {};

  function handleTabChange(event: CustomEvent<Tab>) {
    const tab = event.detail;
    activeTab = tab;
  }
</script>

<section class="collection-manager">
  <ul class="inner-tab-list">
    <li>Browse Collections</li>
    <li>New collection</li>
  </ul>
  {#if activeCollection}
    <div class="active-collection-shortcut">
      <p><span>Active Collection</span> {activeCollection.name}</p>
    </div>
  {/if}
  {#if activeTab === "all"}
    <div class="collection-list">
      <ul>
        <li>Collection 1</li>
        <li>Collection 2</li>
        <li>Collection 3</li>
      </ul>
    </div>
  {:else if activeTab === "active"}
    <CollectionInstance />
  {:else}
    <CreateCollection />
  {/if}
</section>

<style>
  .collection-manager {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    height: 500px;
    width: 280px;
    overflow-y: scroll;
  }
  .collection-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 300px;
    padding: 5px;
    justify-content: space-around;
  }
  ul.inner-tab-list{
    flex-direction: row;
  }

  li {
    width: 140px;
    list-style: none;
    display: flex;
    justify-content: start;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    white-space: nowrap;
  }

  li:hover {
    color: #2c58e9;
  }

  .active {
    color: green;
  }
</style>
