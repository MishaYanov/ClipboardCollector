<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type IRecord from "../models/IRecord";
  import MdiContentCopy from "./icons/MdiContentCopy.svelte";
  import Tooltip from "./Tooltip.svelte";

  export let record: IRecord;

  //text overflow state
  let ref: any;
  let isOverflowing = false;
  let observer;
  //tooltip state
  let showTooltip = false;
  let hoverTimeout: ReturnType<typeof setTimeout>;
  let tooltipPosition = { x: 0, y: 0 };
  // expanded state
  let isExpanded = false;

  onMount(() => {
    observer = new ResizeObserver(checkTextWidth);
    observer.observe(ref);
    checkTextWidth();
    document.addEventListener("click", handleDocumentClick);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleDocumentClick);
  });

  function checkTextWidth() {
    const width = ref.scrollWidth;
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
    isExpanded = !isExpanded;
    showTooltip = false;
  };

  function handleDocumentClick(event: MouseEvent) {
    if (ref && !ref.contains(event.target as Node)) {
      isExpanded = false;
    }
  }

  function handleMouseEnter(event: MouseEvent) {
    hoverTimeout = setTimeout(() => {
      const rect = ref.getBoundingClientRect();
      tooltipPosition = {
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 5, // Adjust vertical position as needed
      };
      showTooltip = true;
    }, 1000); // 1 second delay
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout);
    showTooltip = false;
  }
  const editText = () => {
    submitRecord();
  };
  const submitRecord = () => {};
  console.log(record);
</script>

<div class="copy-record" class:expanded={isExpanded}>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute a11y-no-static-element-interactions -->
  <a
    class="copy-record-text"
    on:click={expandRecord}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    <p bind:this={ref}>
      {record.text}
    </p>
    {#if isOverflowing && !isExpanded}
      <span> ...</span>
    {/if}
    {#if isExpanded}
      <div class="action-bar-expanded">
        <button on:click={editText}>Edit</button>
        <div class="copy-record-actions-expanded">
          <a class="copy-action" on:click={copyToClipboard}
            ><MdiContentCopy class="icon" /></a
          >
        </div>
      </div>
    {/if}
  </a>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute a11y-no-static-element-interactions -->
  {#if !isExpanded}
    <div class="copy-record-actions">
      <a class="copy-action" on:click={copyToClipboard}
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
    height: 40px;
    width: 280px;
    font-family: Arial, sans-serif;
    border-left: 2px solid #2c58e9;
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
  .copy-action:hover {
    color: #1d4cb1;
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
    border-color: green;
    width: 280px;
  }
  .expanded .copy-record-text {
    white-space: normal;
    justify-self: start;
    align-self: start;
    height: fit-content;
    width: 100%;
    flex-direction: column;
  }
  .expanded p {
    max-width: 100%;
    white-space: normal;
    height: fit-content;
    max-height: 250px;
    min-height: 40px;
    padding: 0 10px;
    overflow-y: scroll;
  }
  .expanded .copy-record-actions {
    display: none;
  }
  .action-bar-expanded {
    height: 60px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
  }
  .copy-record-actions-expanded {
  
  }
</style>
