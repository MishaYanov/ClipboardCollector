<script lang="ts">
  import type IRecord from "../models/IRecord";
  import Record from "./Record.svelte";

  export let records: IRecord[] | null = null;
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
