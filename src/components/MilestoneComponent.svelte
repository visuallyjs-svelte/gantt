<script lang="ts">
import { getContext } from 'svelte'
import type { SvelteWrapperProps } from "@visuallyjs/browser-ui-svelte"
import type { Gantt } from '../defs'
import { BAR_HEIGHT } from '../constants'

let { data, vertex }: SvelteWrapperProps = $props()
const gantt = getContext<Gantt>('gantt')
</script>

<div class="vjs-gantt-task-group"
     data-vjs-target="true"
     style:left="{data.left}px"
     style:width="{data.size}px"
     style:height="{BAR_HEIGHT}px"
     style:background-color={data.color}
     data-vjs-y-resize="false"
     data-vjs-x-resize="false"
     data-vjs-not-draggable="true">
    <div class="vjs-gantt-delete" onclick={() => gantt.removeTask(vertex.id)}>×</div>
    <div class="vjs-gantt-connect" data-vjs-source="true">+</div>
</div>
