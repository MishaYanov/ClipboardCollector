<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PopupToBackGroundMessageType, type ICollection } from '../../models';
  import { generateTimestamp } from '../../utils';
  import MessageService from '../../services/MessageService';

  export let collection: ICollection;

  const dispatch = createEventDispatcher();

  // Get the MessageService instance
  const messageService = MessageService.getInstance();

  // Form fields
  let recordText: string = '';
  let recordURL: string = '';
  let recordShortcut: string = '';

  // State variables
  let addingRecord: boolean = false;
  let errorMessage: string = '';
  let successMessage: string = '';

  // Handle form submission
  const submitForm = (event: Event) => {
    event.preventDefault();
    errorMessage = '';
    successMessage = '';

    // Validate form
    if (!validateForm()) {
      errorMessage = 'Please fill in the required fields.';
      return;
    }

    addingRecord = true;

    // Prepare payload
    const payload = {
      collectionId: collection.id,
      text: recordText.trim(),
      url: recordURL.trim() || undefined,
      shortcut: recordShortcut.trim() || undefined,
      timestamp: generateTimestamp(),
    };

    messageService.sendMessage(
      {
        type: PopupToBackGroundMessageType.ADD_COLLECTION_RECORD,
        payload,
      },
      (response) => {
        if (
          response &&
          response.type === PopupToBackGroundMessageType.COLLECTION_RECORD_ADDED
        ) {
          if (response.payload?.collectionId === collection.id) {
            successMessage = 'Record added successfully!';
            recordText = '';
            recordURL = '';
            recordShortcut = '';
            addingRecord = false;
            dispatch('recordAdded');
          }
        } else if (response && response.type === PopupToBackGroundMessageType.ERROR) {
          if (response.payload?.collectionId === collection.id) {
            errorMessage =
              response.payload.error || 'An error occurred while adding the record.';
            addingRecord = false;
          }
        } else {
          errorMessage = 'Unexpected error occurred.';
          addingRecord = false;
        }
      }
    );
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    return recordText.trim().length > 0;
  };

  // Handle cancellation
  const cancel = () => {
    dispatch('cancel');
  };
</script>

<section class="add-record">
  <h3>Add New Record</h3>

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}

  {#if successMessage}
    <p class="success-message">{successMessage}</p>
  {/if}

  <form on:submit={submitForm}>
    <label for="record-text">
      Text<span class="required">*</span>
    </label>
    <input
      type="text"
      id="record-text"
      name="record-text"
      bind:value={recordText}
      required
      placeholder="Enter record text"
    />

    <label for="record-url">URL</label>
    <input
      type="url"
      id="record-url"
      name="record-url"
      bind:value={recordURL}
      placeholder="Enter URL (optional)"
    />

    <label for="record-shortcut">Shortcut</label>
    <input
      type="text"
      id="record-shortcut"
      name="record-shortcut"
      bind:value={recordShortcut}
      placeholder="Enter shortcut (optional)"
    />

    <div class="form-actions">
      <button type="submit" disabled={addingRecord}>
        {#if addingRecord}
          Adding...
        {:else}
          Add Record
        {/if}
      </button>
      <button type="button" on:click={cancel}>Cancel</button>
    </div>
  </form>
</section>

<style>
  .add-record {
    padding: 1rem;
    border-top: 1px solid #eee;
  }

  .add-record h3 {
    margin-bottom: 0.5rem;
  }

  .error-message {
    color: red;
    margin-bottom: 0.5rem;
  }

  .success-message {
    color: green;
    margin-bottom: 0.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    font-weight: bold;
  }

  .required {
    color: red;
    margin-left: 0.25rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type='submit'] {
    background-color: #2c58e9;
    color: white;
  }

  button[type='submit']:disabled {
    background-color: #a0c4ff;
    cursor: not-allowed;
  }

  button[type='button'] {
    background-color: #ccc;
    color: black;
  }

  button[type='button']:hover {
    background-color: #bbb;
  }
</style>
