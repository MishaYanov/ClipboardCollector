<script lang="ts">
  import type { IPopupMessage } from "../models/IPopupMessage";
  import type { IRecord } from "../models/";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import MessageService from "../services/MessageService";
  import Record from "./Record.svelte";

  export let records: IRecord[] | null = null;
  export let activeTab: string;

  const messageService = MessageService.getInstance();

  const message: IPopupMessage = {
    type: PopupToBackGroundMessageType.GREET,
    payload: "Hello from the popup!",
  };

  const getRecords = async (msg:IPopupMessage) => {
    messageService.sendMessage(message, (response) => {
      if (response && response.type === PopupToBackGroundMessageType.GET_ALL) {
        console.log(response);
        records = response.records;
      }
    });
  }

  $: if (activeTab === "clipboard") {
    getRecords(message);
  }
</script>

<section class="record-list">
  {#if records === null}
    <p>Loading records...</p>
  {:else if records.length > 0}
    {#each records as record (record.id)}
      <Record {record} />
    {/each}
  {:else}
    <p>No records found.</p>
  {/if}
</section>

<style>
  .record-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 290px;
  }
</style>
