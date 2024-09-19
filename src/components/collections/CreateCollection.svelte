<script lang="ts">
  import PortService from "../../services/backgroundPortHandler";
  import { PortName, PopupToBackGroundMessageType } from "../../models";
  import { generateTimestamp } from "../../utils";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const bp = PortService.getInstance(PortName.POPUP);

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
  <label for="collection-name">Collection Name</label>
  <input
    type="text"
    id="collection-name"
    name="collection-name"
    bind:value={collectionName}
    required
  />
  <button type="submit">Create Collection</button>
  <button type="button" on:click={goBackToCollectionList}
    >Back To Collection List</button
  >
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
