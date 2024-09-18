<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import RecordList from "../components/RecordList.svelte";
  import type { IPopupMessage } from "../models/IPopupMessage";
  import type IRecord from "../models/IRecord";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";

  let records: IRecord[] | null = null;
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

<main>
  <Navbar />
  <RecordList {records} />
</main>

<style>
  /* Your CSS styles */
</style>
