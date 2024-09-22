<script lang="ts">
    export let text: string = '';
    export let show: boolean = false;
    export let position = { x: 0, y: 0 };
  </script>
  
  {#if show}
    <div
      class="tooltip"
      style="top: {position.y}px; left: {position.x}px;"
      role="tooltip"
      aria-hidden={!show}
    >
      {text}
    </div>
  {/if}
  
  <style>
    .tooltip {
      position: fixed;
      background-color: #333;
      color: #fff;
      padding: 5px 8px;
      border: solid 1px var(--electric-blue);
      font-size: 14px;
      z-index: 1000;
      width: 250px;
    }
  </style>
  