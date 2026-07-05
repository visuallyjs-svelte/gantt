<script lang="ts">
import type { SvelteWrapperProps } from "@visuallyjs/browser-ui-svelte"
import { BAR_HEIGHT } from '../gantt/constants'

let { data, vertex }: SvelteWrapperProps = $props()
</script>

<div class="vjs-gantt-task-group"
     data-vjs-target="true"
     style:left="{data.left}px"
     style:width="{data.size}px"
     style:height="{BAR_HEIGHT}px"
     style:background-color={data.color}
     data-vjs-resizable="false"
     data-vjs-not-draggable="true">
    <div class="vjs-gantt-connect" data-vjs-source="true">+</div>
</div>
