<script lang="ts">

    import {useSurface, useZoom} from "@visuallyjs/browser-ui-svelte";

    import type {LabelEntry} from "../gantt/defs";
    import {getGanttContext} from "../gantt-context.svelte";
    import {TYPE_TASK_GROUP} from "../gantt/constants";

	const gantt = getGanttContext()

	let headerSize = $state(0)
    let entries:Array<LabelEntry> = $state([])

	const surface = useSurface()
	const zoom = useZoom(surface)

    function repaint() {
        if (gantt.instance != null) {
            headerSize = gantt.instance.headerSize
			entries = gantt.instance.labels
        }
    }

	$effect(() => {
        repaint()
        if (gantt.instance != null) {
            gantt.instance.bind("update", repaint)
            return () => gantt.instance?.unbind("update", repaint)
		}

	})

</script>
{#if gantt.instance != null}
	<div class="vjs-gantt-task-labels-container">
		<div class="vjs-gantt-task-labels">
		<div style="height:{headerSize}px; top:0; background-color:white; position:sticky"/>
		{#each entries as entry (entry.id)}
            <div data-vjs-type={entry.type} class="vjs-gantt-task-label" style="height:{gantt.instance.rowHeight * zoom.current}px; margin-left:{entry.indent}rem">
                {#if entry.type === TYPE_TASK_GROUP}
                    <div class="vjs-gantt-task-group-toggle" onclick={() => gantt.instance.toggleCollapse(entry.id)}>
                        {entry.collapsed ? '+' : '-'}
                    </div>
                {/if}
                {entry.name}
                <div class="vjs-gantt-task-label-controls">
                    <div class="vjs-gantt-task-label-edit" onclick={(e) => { e.stopPropagation(); gantt.instance?.editTask(entry.id); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </div>
                    <div class="vjs-gantt-task-label-delete" onclick={(e) => { e.stopPropagation(); gantt.instance.removeTask(entry.id); }}>
                        ×
                    </div>
                </div>
            </div>
        {/each}
	</div></div>
	{/if}
