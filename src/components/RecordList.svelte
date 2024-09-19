<script lang="ts">
  import type { IPopupMessage } from "../models/IPopupMessage";
  import type { IRecord } from "../models/";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";
  import Record from "./Record.svelte";

  export let records: IRecord[] | null = null;
  export let activeTab: string;

  const ps = PortService.getInstance(PortName.POPUP);


  const message: IPopupMessage = {
    type: PopupToBackGroundMessageType.GREET,
    payload: "Hello from the popup!",
  };
  
  $: if (activeTab === "clipboard") {
    ps.sendMessage(message);
  }
 

  ps.onMessage((message) => {
    if (message.type === PopupToBackGroundMessageType.GET_ALL) {
      console.log(message);
      records = message.records;
    }
  });

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
    gap: 3px;
  }
</style>
