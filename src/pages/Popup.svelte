<script lang="ts">
  import Navbar from "../components/Navbar.svelte";
  import RecordList from "../components/RecordList.svelte";
  import Collections from "../components/Collections.svelte";
  import type { IPopupMessage } from "../models/IPopupMessage";
  import type IRecord from "../models/IRecord";
  import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
  import { PortName } from "../models/PortName";
  import PortService from "../services/backgroundPortHandler";

  let records: IRecord[] | null = null;
  let activeTab: "clipboard" | "collections" = "clipboard";

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

  function handleTabChange(event) {
    const tab = event.detail;
    activeTab = tab;
    console.log(activeTab);
  }
</script>

<main>
  <Navbar {activeTab} on:tabChange={handleTabChange} />
  <div class="tab-content">
    <div class:active={activeTab === "clipboard"}>
      <RecordList {records} />
    </div>
    <div class:active={activeTab === "collections"}>
      <Collections />
    </div>
  </div>
</main>

<style>
  .tab-content > div {
    display: none;
  }

  .tab-content > div.active {
    display: block;
  }
</style>
