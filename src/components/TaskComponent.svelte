<script lang="ts">
import type { SvelteWrapperProps } from "@visuallyjs/browser-ui-svelte"
import { BAR_HEIGHT } from '../gantt/constants'

let { data, vertex }: SvelteWrapperProps = $props()
</script>

<div class="vjs-gantt-task"
     data-vjs-target="true"
     style:left="{data.left}px"
     style:width="{data.size}px"
     style:height="{BAR_HEIGHT}px"
     style:background-color={data.color}
     data-vjs-y-resize="false"
     data-vjs-show-progress="true">
    <div class="vjs-gantt-progress-value">{data.progress}</div>
    <div class="vjs-gantt-progress-gauge" style:width="{data.progress}%"></div>
    <div class="vjs-gantt-connect" data-vjs-source="true">+</div>
</div>
