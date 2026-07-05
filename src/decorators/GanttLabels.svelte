<script lang="ts">

	import {Node} from "@visuallyjs/browser-ui"
    import {useSurface, useZoom} from "@visuallyjs/browser-ui-svelte";

    import type {LabelEntry} from "../gantt/defs";
    import {getGanttContext} from "../gantt-context.svelte";
    import {TYPE_TASK_GROUP} from "../gantt/constants";
    import {editTask} from "../gantt/util";
    import {EVENT_DATA_UPDATED, EVENT_REDO, EVENT_UNDO} from "@visuallyjs/browser-ui"

    const initialized = { current: false }
	const gantt = getGanttContext()

    let entries = $state([])

	const surface = useSurface()
	const zoom = useZoom(surface)

    function repaint() {
        if (gantt.instance != null) {
            requestAnimationFrame(() => {
                const newEntries: Array<LabelEntry> = []

                function _one(entry: Node, indent: number) {
                    const collapsed = entry.data['collapsed'] === true
                    newEntries.push({id: entry.id, name: entry.data.name, indent, type: entry.type, collapsed})
                    if (!collapsed) {
                        gantt.instance.listSubtasks(entry).forEach(st => _one(st, indent + 1))
                    }
                }

                gantt.instance.listTopLevelTasks().forEach(entry => {
                    _one(entry, 0)
                })

                entries = newEntries
            })

        }
    }

	$effect(() => {
        if (gantt.instance != null && !initialized.current) {
            initialized.current = true
            const undoHandler = () => repaint();
            const redoHandler = () => repaint();
            const updateHandler = () => repaint();

            gantt.instance.model.bind(EVENT_DATA_UPDATED, updateHandler);
            gantt.instance.model.bind(EVENT_UNDO, undoHandler);
            gantt.instance.model.bind(EVENT_REDO, redoHandler);

            return () => {
                gantt.instance.model.unbind(EVENT_DATA_UPDATED, updateHandler);
                gantt.instance.model.unbind(EVENT_UNDO, undoHandler);
                gantt.instance.model.unbind(EVENT_REDO, redoHandler);
            };
		}
		repaint()
	})

</script>
{#if gantt.instance != null}
	<div class="vjs-gantt-task-labels-container">
		<div class="vjs-gantt-task-labels">
		<div style="height:{gantt.instance.headerSize}px; top:0; background-color:white; position:sticky"/>
		{#each entries as entry (entry.id)}
            <div data-vjs-type={entry.type} class="vjs-gantt-task-label" style="height:{gantt.instance.rowHeight * zoom.current}px; margin-left:{entry.indent}rem">
                {#if entry.type === TYPE_TASK_GROUP}
                    <div class="vjs-gantt-task-group-toggle" onclick={() => gantt.instance.toggleCollapse(entry.id)}>
                        {entry.collapsed ? '+' : '-'}
                    </div>
                {/if}
                {entry.name}
                <div class="vjs-gantt-task-label-controls">
                    <div class="vjs-gantt-task-label-edit" onclick={(e) => { e.stopPropagation(); editTask(gantt.instance, entry.id); }}>
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
