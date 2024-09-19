<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import PortService from "../../services/backgroundPortHandler";
  import {
    PortName,
    PopupToBackGroundMessageType,
    type ICollection,
    type ICollectionRecord,
  } from "../../models";
  import NewCollectionRecord from "./NewCollectionRecord.svelte";
  import CollectionRecord from "./CollectionRecord.svelte";

  // Props
  export let collection: ICollection;
  export let isActive: boolean;

  // Dispatcher for events
  const dispatch = createEventDispatcher();

  // Port for communication
  const ps = PortService.getInstance(PortName.POPUP);

  // State variables
  let records: ICollectionRecord[] | null = null;
  let loadingRecords: boolean = true;
  let showingAddRecordForm: boolean = false;
  let errorMessage: string = "";
  let successMessage: string = "";

  // Fetch records on mount
  onMount(() => {
    getCollectionRecords();
    ps.onMessage(handleMessages);
  });

  const handleMessages = (message: any) => {
    switch (message.type) {
      case PopupToBackGroundMessageType.GET_COLLECTION_RECORDS:
        debugger;
        if (message.payload?.collectionId === collection.id) {
          records = message.payload.collectionRecords;
          loadingRecords = false;
        }
        break;

      case PopupToBackGroundMessageType.COLLECTION_RECORD_ADDED:
        if (message.payload?.collectionId === collection.id) {
          getCollectionRecords();
          successMessage = "Record added successfully!";
          errorMessage = "";
        }
        break;
      //TODO: implement in background script
      case PopupToBackGroundMessageType.COLLECTION_DELETED:
        if (message.payload?.collectionId === collection.id) {
          dispatch("collectionDeleted", { collection });
        }
        break;

      case PopupToBackGroundMessageType.ERROR:
        if (message.payload?.collectionId === collection.id) {
          errorMessage = message.payload.error || "An error occurred.";
          successMessage = "";
        }
        break;

      default:
        break;
    }
  };

  // Fetch records for the current collection
  const getCollectionRecords = () => {
    console.log(collection.id);
    loadingRecords = true;
    ps.sendMessage({
      type: PopupToBackGroundMessageType.GET_COLLECTION_RECORDS,
      payload: { collectionId: collection.id },
    });
  };

  // Handle adding a new record (show the form)
  const addNewRecord = () => {
    showingAddRecordForm = true;
  };

  // Handle setting the collection as active
  const setActive = () => {
    dispatch("setActive", { collection });
  };

  // Handle deleting the collection
  const deleteCollection = () => {
    if (
      confirm(
        `Are you sure you want to delete collection "${collection.name}"?`
      )
    ) {
      ps.sendMessage({
        type: PopupToBackGroundMessageType.DELETE_COLLECTION,
        payload: { collectionId: collection.id },
      });
      // The background script will handle deletion and notify via message
    }
    returnToCollectionList();
  };

  const deleteAndRefetch = (event:any) => {
    ps.sendMessage({
      type: PopupToBackGroundMessageType.DELETE_COLLECTION_RECORD,
      payload: { recordId: event.detail.recordId },
    });
    getCollectionRecords();
  };


  const returnToCollectionList = () => {
    dispatch("close");
  };

  const handleRecordAdded = () => {
    showingAddRecordForm = false;
  };

  const handleCancelAddRecord = () => {
    showingAddRecordForm = false;
  };
</script>

<section class="collection-instance">
  <div class="collection-data">
    <div class="header">
      <h2>{collection.name}</h2>
      <span>{new Date(collection.timestamp).toDateString()}</span>
    </div>
    {#if isActive}
      <p class="active-label">This collection is currently active.</p>
    {/if}
  </div>

  <div class="collection-actions">
    <button class="main" on:click={addNewRecord}>New Record</button>
    <button class="main" on:click={setActive}>Set Active</button>
    <button class="secondary" on:click={deleteCollection}>Delete</button>
    <button class="secondary" on:click={returnToCollectionList}>Return</button>
  </div>

  {#if showingAddRecordForm}
    <NewCollectionRecord
      {collection}
      on:recordAdded={handleRecordAdded}
      on:cancel={handleCancelAddRecord}
    />
  {/if}

  <!-- Display Collection Records -->
  <div class="collection-record-list">
    <h3>Collection Records:</h3>
    {#if loadingRecords || records === null}
      <p>Loading records...</p>
    {:else if records.length > 0}
      {#each records as record}
        <CollectionRecord 
        {record} 
        on:delete={deleteAndRefetch}
        />
      {/each}
    {:else}
      <p>No records in this collection.</p>
    {/if}
  </div>
</section>

<style>
  .collection-instance {
    display: flex;
    flex-direction: column;
    padding: 5px;
  }
  .header {
    display: flex;
    gap: 0.5rem;
    align-items: end;
    height: 30px;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    padding: 0;
  }
  .active-label {
    color: green;
    font-weight: bold;
  }

  .collection-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }

  .collection-actions button:hover {
    background-color: #1a3fbf;
  }

  .collection-record-list {
    margin-top: 0.5rem;
  }

  .collection-record-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .collection-record-list li {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .collection-record-list .record-text {
    font-size: 1rem;
    font-weight: bold;
  }

  .collection-record-list .record-url a {
    color: #2c58e9;
    text-decoration: none;
  }

  .collection-record-list .record-shortcut {
    font-size: 0.9rem;
    color: #555;
  }

  .collection-record-list .record-timestamp {
    font-size: 0.8rem;
    color: #999;
  }
</style>
