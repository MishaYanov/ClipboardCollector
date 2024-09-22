<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { PopupToBackGroundMessageType, PortName, type IRecord } from "../models/";
  import Tooltip from "./Tooltip.svelte";
  import MdiDeleteAlertOutline from "./icons/MdiDeleteAlertOutline.svelte";
  import MdiClose from "./icons/MdiClose.svelte";
  import MdiCheck from "./icons/MdiCheck.svelte";
  import MdiContentCopy from "./icons/MdiContentCopy.svelte";
  import Popup from "../pages/Popup.svelte";
  import PortService from "../services/backgroundPortHandler";

  export let record: IRecord;

  //text overflow state
  let textRef: any;
  let recordRef: any;
  let isOverflowing = false;
  let observer;
  //tooltip state
  let showTooltip = false;
  let hoverTimeout: ReturnType<typeof setTimeout>;
  let tooltipPosition = { x: 0, y: 0 };
  // expanded state
  let isExpanded = false;
  // edit state
  let isEditing = false;

  onMount(async () => {
    await tick();
    observer = new ResizeObserver(checkTextWidth);
    if (textRef) {
      observer.observe(textRef);
      checkTextWidth();
    }
    document.addEventListener("click", handleDocumentClick);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleDocumentClick);
  });

  function checkTextWidth() {
    if (!textRef) return;
    const width = textRef.scrollWidth;
    if (width > 200) {
      isOverflowing = true;
    } else {
      isOverflowing = false;
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(record.text);
  };

  const expandRecord = () => {
    isExpanded = true;
    showTooltip = false;
  };

  const minimize = () => {
    isExpanded = false;
  };

  function handleDocumentClick(event: MouseEvent) {
    if (recordRef && !recordRef.contains(event.target as Node)) {
      isExpanded = false;
    }
  }

  function handleMouseEnter(event: MouseEvent) {
    hoverTimeout = setTimeout(() => {
      const rect = textRef.getBoundingClientRect();
      tooltipPosition = {
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 5,
      };
      showTooltip = true;
    }, 1000);
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout);
    showTooltip = false;
  }

  const openLink = () => {
    //TODO: highlight the text in the page
    if (record.url) chrome.tabs.create({ url: record.url });
  };

  //TODO: add tooltip for the text
  const editText = () => {
    isEditing = true;
    submitRecord();
  };

  //TODO: add tooltip for the text
  const deleteRecord = () => {
    const ps = PortService.getInstance(PortName.POPUP);
    ps.sendMessage({
      type: PopupToBackGroundMessageType.DELETE,
      payload: { id: record.id },
    });
  };

  //TODO: add tooltip for the text
  const submitRecord = () => {};
</script>

<div class="copy-record" class:expanded={isExpanded} bind:this={recordRef}>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute a11y-no-static-element-interactions -->
  <a
    class="copy-record-text"
    on:click={expandRecord}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    {#if !isEditing}
      <p bind:this={textRef}>
        {record.text}
      </p>
      {#if isOverflowing && !isExpanded}
        <span> ...</span>
      {/if}
    {:else}
      <textarea class="update-text" bind:value={record.text} />
    {/if}

    {#if isExpanded && !isEditing}
      {#if record.url}
        <div class="link" on:click={openLink}>
          <p>Navigate to URL</p>
        </div>
      {/if}

      {#if isEditing}
        <div class="action-bar-expanded">
          <a class="action">
            <MdiCheck class="icon" />
          </a>
          <a class="action">
            <MdiClose class="icon" />
          </a>
        </div>
      {:else}
        <div class="action-bar-expanded">
          <!-- <a class="action" on:click={editText}>
            <MdiCommentEditOutline class="icon" />
          </a> -->
          <a class="action" on:click={copyToClipboard}
            ><MdiContentCopy class="icon" /></a
          >
          <a class="action" on:click={deleteRecord}>
            <MdiDeleteAlertOutline class="icon" />
          </a>
          <a class="action" on:click={minimize}>
            <MdiClose class="icon" />
          </a>
        </div>
      {/if}
    {/if}
  </a>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute a11y-no-static-element-interactions -->
  {#if !isExpanded}
    <div class="copy-record-actions">
      <a class="action" on:click={copyToClipboard}
        ><MdiContentCopy class="icon" /></a
      >
    </div>
  {/if}
</div>

{#if isOverflowing && !isExpanded}
  <Tooltip text={record.text} show={showTooltip} position={tooltipPosition} />
{/if}

<style>
  .copy-record {
    height: 60px;
    width: 280px;
    font-family: Arial, sans-serif;
    border-left: 2px solid var(--electric-blue);
    display: flex;
  }
  .copy-record-text {
    display: flex;
    align-items: center;
    width: 80%;
    padding: 0 10px;
    cursor: pointer;
  }
  .copy-record-actions {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  p {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    max-width: 200px;
    white-space: nowrap;
  }
  span {
    padding-left: 2px;
  }
  .expanded {
    min-height: 100px !important;
    height: fit-content !important;
    border-color: var(--cyber-lime);
    width: 280px;
  }
  .expanded .copy-record-text {
    margin: 0.8rem 0;
    white-space: normal;
    justify-self: start;
    align-self: start;
    height: fit-content;
    width: 100%;
    flex-direction: column;

    cursor: default;
  }
  .expanded p {
    margin: .5rem 0;;
    max-width: 100%;
    white-space: normal;
    height: fit-content;
    min-height: 40px;
    padding: 0 10px;
    overflow-y: scroll;
  }
  .expanded .copy-record-actions {
    display: none;
  }
  .action-bar-expanded {
    height: 3 0px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
  }
  .link {
    color: var(--cool-white);
    cursor: pointer;
    height: 24px;
    padding: .5rem 0;
  }
  .link:hover {
    color: var(--cyber-lime);
  }
  .update-text {
    white-space: normal;
    padding: 0 10px;
    width: 100%;
    height: 250px;
    resize: none;
  }
</style>
