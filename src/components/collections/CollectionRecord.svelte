<!-- RecordItem.svelte -->
<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
  import type { ICollectionRecord } from "../../models";
  import Tooltip from "../Tooltip.svelte";
  import MdiContentCopy from "../icons/MdiContentCopy.svelte";
  import MdiDeleteAlertOutline from "../icons/MdiDeleteAlertOutline.svelte";
  import MdiClose from "../icons/MdiClose.svelte";
  import MdiCheck from "../icons/MdiCheck.svelte";

  export let record: ICollectionRecord;

  const dispatch = createEventDispatcher();

  // Text overflow state
  let textRef: HTMLElement;
  let recordRef: HTMLElement;
  let isOverflowing = false;
  let observer: ResizeObserver;

  // Tooltip state
  let showTooltip = false;
  let hoverTimeout: ReturnType<typeof setTimeout>;
  let tooltipPosition = { x: 0, y: 0 };

  // Expanded state
  let isExpanded = false;

  // Edit state
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
    if (observer && textRef) {
      observer.unobserve(textRef);
    }
  });

  function checkTextWidth() {
    if (!textRef) return;
    const isTextOverflowing = textRef.scrollWidth > textRef.clientWidth;
    isOverflowing = isTextOverflowing;
  }

  // Tooltip functions
  function handleMouseEnter(event: MouseEvent) {
    hoverTimeout = setTimeout(() => {
      const rect = textRef.getBoundingClientRect();
      tooltipPosition = {
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 5,
      };
      showTooltip = true;
    }, 1000); // 1-second delay
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout);
    showTooltip = false;
  }

  // Expand and minimize functions
  function expandRecord() {
    isExpanded = true;
    showTooltip = false;
  }

  function minimizeRecord() {
    isExpanded = false;
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(record.text);
  };

  // Delete record
  const deleteRecord = () => {
    dispatch('delete', { recordId: record.id });
  };

  // Handle clicks outside the component to minimize
  function handleDocumentClick(event: MouseEvent) {
    if (recordRef && !recordRef.contains(event.target as Node)) {
      isExpanded = false;
    }
  }

  // Optional: Implement editing functionality
  const editRecord = () => {
    isEditing = true;
    // Implement further editing logic
  };

  const submitEdit = () => {
    // Implement submission logic
    isEditing = false;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="record-item {isExpanded ? 'expanded' : ''}" bind:this={recordRef}>
  <div
    class="record-data"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={expandRecord}
  >
    <div class="data-item">
      <span class="data-text" bind:this={textRef}>
        Clipboard text: {record.text}
      </span>
      {#if isOverflowing && !isExpanded}
        <span>...</span>
      {/if}
    </div>
    <div class="data-item">
      {#if record.shortcut}
        <span>Shortcut: {record.shortcut}</span>
      {/if}
    </div>
  </div>

  <div class="record-actions">
    <!-- TODO: change to icons -->
    <a class="action" on:click|stopPropagation={copyToClipboard}>
      <MdiContentCopy class="icon" />
    </a>
    {#if isExpanded && !isEditing}
      <a class="action" on:click|stopPropagation={deleteRecord}>
        <MdiDeleteAlertOutline class="icon" />
      </a>
      <a class="action" on:click|stopPropagation={minimizeRecord}>
        <MdiClose class="icon" />
      </a>
    {/if}
    {#if isExpanded && isEditing}
      <a class="action" on:click|stopPropagation={submitEdit}>
        <MdiCheck class="icon" />
      </a>
      <a class="action" on:click|stopPropagation={() => (isEditing = false)}>
        <MdiClose class="icon" />
      </a>
    {/if}
  </div>
</div>

{#if isOverflowing && showTooltip && !isExpanded}
  <Tooltip text={record.text} show={showTooltip} position={tooltipPosition} />
{/if}

<style>
  .record-item {
    height: 60px;
    width: 280px;
    font-family: Arial, sans-serif;
    border-left: 2px solid #2c58e9;
    display: flex;
    padding: 5px;
    position: relative;
    transition: all 0.3s ease;
  }
  .record-data {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
    height: 60px;
    width: 80%;
    cursor: pointer;
    overflow: hidden;
  }
  .record-item.expanded .record-data {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
    height: fit-content;
    width: 80%;
    cursor: default;
    overflow: hidden;
  }
  .data-item {
    height: 20px;
    display: flex;
    align-items: center;
  }
  .data-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .record-item.expanded .data-text, .record-item.expanded .data-item {
    max-width: 100%;
    white-space: normal;
    height: fit-content;
    cursor: default;
  }
  .record-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20%;
    margin-top: 5px;
    gap: 10px;
  }
  .action {
    cursor: pointer;
    color: #2c58e9;
  }
  .action:hover {
    color: #1a3fbf;
  }
  /* Expanded styles */
  .record-item.expanded {
    height: auto;
    border-color: green;
    flex-direction: column;
  }
  .record-item.expanded .record-data {
    height: auto;
    white-space: normal;
    width: 100%;
  }
  .record-item.expanded .data-text {
    max-width: 100%;
    white-space: normal;
  }
  .record-item.expanded .record-actions {
    height: auto;
    width: 100%;
  }
  .record-item.expanded textarea {
    width: 100%;
    height: 100px;
    resize: vertical;
  }
</style>
