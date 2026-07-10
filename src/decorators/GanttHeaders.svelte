<script lang="ts">
    import type { TimelineHeaderDayEntryValue, TimelineHeaderEntry } from "../gantt/defs.ts";
    import { getGanttContext } from "../gantt-context.svelte.ts";
    import { STEP_WIDTH } from "../gantt/constants.ts";
    import { useSurface, useZoom } from "@visuallyjs/browser-ui-svelte";

    let headers = $state<Array<TimelineHeaderEntry>>([])
    let dayRange = $state<number>(0)

    let ganttContext = getGanttContext();
    let gantt = $derived(ganttContext.instance);

    const surface = useSurface()
    const zoom = useZoom(surface)

    $effect(() => {
        if (gantt) {
            repaint();
            gantt.bind("update", repaint)
			return () => gantt.unbind("update", repaint)
        }
    });


    function repaint() {
        if (gantt != null) {
            dayRange = gantt.dayRange
			headers = gantt.headers
        }
    }
</script>

{#snippet timelineLabel(v: TimelineHeaderDayEntryValue)}
    {#if gantt.showDayName && gantt.showDayNumber}
        <span>{v.day}</span>
        <span class="vjs-gantt-day-name">{v.label}</span>
    {:else if !gantt.showDayName && gantt.showDayNumber}
        <span>{v.day}</span>
    {:else if !gantt.showDayNumber}
        <span>{v.label}</span>
    {/if}
{/snippet}

<div class="vjs-gantt-timeline-container">
    <div class="vjs-gantt-timeline" style:width="{dayRange * STEP_WIDTH}px">
        {#each headers as header (header.id)}
            <div class="vjs-gantt-timeline-row vjs-gantt-timeline-{header.id}">
                {#each header.values as value (value.id)}
                    <div class="vjs-gantt-timeline-entry"
                         style:flex-basis="{value.size * zoom.current}px"
                         style:height="{gantt.rowHeight}px">
                        {#if value.type === 'day'}
                            {@render timelineLabel(value)}
                        {:else}
                            {value.label}
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
