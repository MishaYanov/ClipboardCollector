<script lang="ts">
  import type { IPopupMessage } from "../models/IPopupMessage";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";

  let records: any[] | null = null;
  const ps = new PortService(PortName.POPUP);

  const message: IPopupMessage = {
    type: PopupToBackGroundMessageType.GREET,
    payload: "Hello from the popup!",
  };

  ps.sendMessage(message);

  ps.onMessage((message) => {
    if (message.type === PopupToBackGroundMessageType.GET_ALL) {
      console.log(message);
      records = message.records;
    }
  });
</script>

<div>
  {#if records === null}
  <p>Loading records...</p>
  {:else if records.length > 0}
    <ul>
      {#each records as record (record.id)}
        <li>
          <strong>ID:</strong>
          {record.id} <br />
          <strong>Text:</strong>
          {record.text} <br />
          <strong>URL:</strong>
          <a href={record.url} target="_blank">{record.url}</a> <br />
          <strong>Timestamp:</strong>
          {new Date(record.timestamp).toLocaleString()}
        </li>
      {/each}
    </ul>
  {:else}
    <p>No records found.</p>
  {/if}
</div>

<style>
  /* Your CSS styles */
</style>
