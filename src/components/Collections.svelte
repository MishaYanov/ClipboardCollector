<script lang="ts">
  import { onMount } from "svelte";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";
  import CollectionInstance from "./collections/CollectionInstance.svelte";
  import CreateCollection from "./collections/CreateCollection.svelte";
  import type { ICollection, IPopupMessage } from "../models";
  import MdiClose from "./icons/MdiClose.svelte";

  type Tab = "active" | "new" | "all";

  let ps: PortService;
  let collections: ICollection[] | null = null;
  // collection manager state
  let activeTab: Tab = "all";
  let activeCollection: ICollection | null = null;
  let chosenCollection: ICollection | null = null;
  let isCreatingCollection = false;

  onMount(() => {
    ps = PortService.getInstance(PortName.POPUP);
    //requests for background data
    ps.sendMessage({ type: PopupToBackGroundMessageType.GET_ALL_COLLECTIONS });
    ps.sendMessage({
      type: PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION,
    });
    // listen for messages from background
    ps.onMessage((message: IPopupMessage) => {
      if (message.type === PopupToBackGroundMessageType.GET_ALL_COLLECTIONS) {
        console.log(message);
        if (message.collections) collections = message.collections;
      }
      if (message.type === PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION) {
        const activeCollectionId = message.payload?.id;
        if (activeCollectionId) {
          activeCollection =
            collections?.find((c) => c.id === activeCollectionId) || null;
        }
      }
    });
  });

  //create new collection
  const createCollection = () => {
    isCreatingCollection = true;
  };

  //set active collection
  const setActiveCollection = (collection: ICollection) => {
    ps.sendMessage({
      type: PopupToBackGroundMessageType.SET_ACTIVE_COLLECTION,
      payload: { id: collection.id },
    });
    activeCollection = collection;
  };

  //remove active collection
  const removeActiveCollection = () => {
    if (activeCollection === null) return;
    ps.sendMessage({
      type: PopupToBackGroundMessageType.SET_ACTIVE_COLLECTION,
      payload: { id: null },
    });
    activeCollection = null;
  };

  const openCollection = (collection: ICollection) => {
    chosenCollection = collection;
  };

  //events
  const handleClose = () => {
    isCreatingCollection = false;
    chosenCollection = null;
  };

  const handleActiveCollectionSet = (collection: ICollection) => {
    setActiveCollection(collection);
  };

  function handleTabChange(event: CustomEvent<Tab>) {
    const tab = event.detail;
    activeTab = tab;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-missing-attribute -->
<section class="collection-manager">
  {#if isCreatingCollection}
    <CreateCollection
      on:collectionCreated={handleClose}
      on:close={handleClose}
    />
  {:else}
    <ul class="inner-tab-list">
      <li on:click={handleClose}>Browse Collections</li>
      <li on:click={createCollection}>New collection</li>
    </ul>
    {#if activeCollection && !chosenCollection}
      <div class="active-collection-shortcut">
        <p>Active Collection: <span>{activeCollection.name}</span></p>
        <a class="action" on:click={removeActiveCollection}>
          <MdiClose class="icon" />
        </a>
      </div>
    {/if}
    {#if !chosenCollection}
      <div class="collection-list">
        {#if collections === null}
          <p>Loading collections...</p>
        {:else if collections.length > 0}
          {#each collections as collection (collection.id)}
            <li
              on:click={() => {
                openCollection(collection);
              }}
            >
              {collection.name}
            </li>
          {/each}
        {:else}
          <p>No collections found.</p>
        {/if}
      </div>
    {:else if chosenCollection}
      <CollectionInstance
        collection={chosenCollection}
        isActive={() => {
          return activeCollection?.id === chosenCollection?.id;
        }}
        on:close={handleClose}
        on:setActive={setActiveCollection(chosenCollection)}
      />
    {/if}
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
  ul.inner-tab-list {
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
  .active-collection-shortcut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    font-size: 1rem;
  }
  .active-collection-shortcut span {
    color: green;
    font-weight: 700;
  }
  .active {
    color: green;
  }
</style>
