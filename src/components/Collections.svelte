<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";
  import CollectionInstance from "./collections/CollectionInstance.svelte";
  import CreateCollection from "./collections/CreateCollection.svelte";
  import type { ICollection, IPopupMessage } from "../models";
  import MdiClose from "./icons/MdiClose.svelte";

  export let activeTab: string;

  let ps: PortService;
  let collections: ICollection[] | null = null;
  // collection manager state

  let activeCollection: ICollection | null = null;
  let chosenCollection: ICollection | null = null;
  let isCreatingCollection = false;

  onMount(() => {
    ps = PortService.getInstance(PortName.POPUP);
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

  $: if (activeTab === "collections") {
    ps.sendMessage({ type: PopupToBackGroundMessageType.GET_ALL_COLLECTIONS });
    ps.sendMessage({
      type: PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION,
    });
  } else {
    handleClose();
  }

  //create new collection
  const createCollection = () => {
    isCreatingCollection = true;
  };

  //set active collection
  const setActiveCollection = (collection: ICollection): any => {
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
          <h2>All collections</h2>
          {#each collections as collection (collection.id)}
            <div
              class="collection-item"
              on:click={() => {
                openCollection(collection);
              }}
            >
              {collection.name}
            </div>
          {/each}
        {:else}
          <p>No collections found.</p>
        {/if}
      </div>
    {:else if chosenCollection}
      <CollectionInstance
        collection={chosenCollection}
        isActive={activeCollection?.id === chosenCollection?.id}
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
    height: 500px;
    width: 300px;
    overflow-y: scroll;
  }

  ul.inner-tab-list {
    display: flex;
    padding: 5px;
    width: 300px;
    gap: 5px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--electric-blue) solid 1px;
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
  .collection-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .collection-item {
    height: 40px;
    width: 280px;
    font-family: Arial, sans-serif;
    border-left: 1px solid var(--electric-blue);
    display: flex;
    font-size: 1rem;
    align-items: center;
    padding: 5px;
    cursor: pointer;
    margin-left: 3px;
  }
  li:hover {
    color: var(--electric-blue);
  }
  .active-collection-shortcut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    font-size: 1rem;
  }
  .active-collection-shortcut span {
    color: var(--neon-green);
    font-weight: 700;
  }
</style>
