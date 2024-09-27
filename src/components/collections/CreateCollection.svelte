<script lang="ts">
  import { PopupToBackGroundMessageType } from "../../models";
  import { generateTimestamp } from "../../utils";
  import { createEventDispatcher } from "svelte";
  import MessageService from "../../services/MessageService";

  const dispatch = createEventDispatcher();

  const bp = MessageService.getInstance()

  let collectionName: string = "";

  const validateCollectionName = (name: string): boolean => {
    return name.trim().length > 0;
  };

  const submitForm = (event: Event) => {
    event.preventDefault();
    if (validateCollectionName(collectionName)) {
      const pl = {
        name: collectionName,
        timestamp: generateTimestamp(),
      };
      bp.sendMessage({
        type: PopupToBackGroundMessageType.ADD_COLLECTION,
        payload: pl,
      });
    }
    goBackToCollectionList();
    // TODO: Implement dispatching an event to notify the parent component
    dispatch('collectionCreated', { collectionName });
  };

  const goBackToCollectionList = () => {
    dispatch('close');
  };
</script>

<form on:submit={submitForm}>
  <label for="collection-name"><h2>Collection Name</h2></label>
  <input
    type="text"
    id="collection-name"
    name="collection-name"
    bind:value={collectionName}
    required
  />
  <button class="main" type="submit">Create Collection</button>
  <button class="secondary" type="button" on:click={goBackToCollectionList}
    >Back To Collection List</button
  >
</form>

<style>
  form {
    height: 459px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  h2 {
    font-size: 1.5rem;
    padding: 0;
    margin: 0;
  }
  input {
    padding: 0.5rem;
    font-size: 1rem;
    width: 80%;
    margin-bottom: 1rem;
  }
  button{
    min-width: 200px;
  }
</style>
