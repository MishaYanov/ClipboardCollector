<script lang="ts">
  import type IRecord from "../models/IRecord";

  export let record: IRecord;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(record.text);
  };
  const expandRecord = () => {};
  const handleHover = () => {};
  const editText = () => {};
  const submitRecord = () => {};
  console.log(record);
</script>

<div class="copy-record">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute a11y-no-static-element-interactions -->
  <a class="copy-record-text" on:click={expandRecord} >
    <p>
      {record.text}
    </p>
    <span> ...</span>
  </a>

  <div class="copy-record-actions">
    <button on:click={copyToClipboard}>Copy</button>
  </div>
</div>

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
</style>
