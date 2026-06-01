<script lang="ts">
import { getContext } from 'svelte'
import type { Gantt } from './defs'
import { addNewTask, addNewTaskGroup, addNewMilestone } from './util'

const gantt = getContext<Gantt>('gantt')
</script>

<div class="vjs-gantt-controls">
    <button onclick={() => addNewTask(gantt)}>NEW TASK</button>
    <button onclick={() => addNewTaskGroup(gantt)}>NEW TASK GROUP</button>
    <button onclick={() => addNewMilestone(gantt)}>NEW MILESTONE</button>
    <button onclick={() => gantt.exportToConsole()}>EXPORT TO CONSOLE</button>
    <button onclick={() => gantt.model?.undo()}>UNDO</button>
    <button onclick={() => gantt.model?.redo()}>REDO</button>
</div>
