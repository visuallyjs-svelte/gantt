<script lang="ts">
    import { EVENT_DATA_UPDATED } from "@visuallyjs/browser-ui"
    import type { Gantt, TimelineHeaderDayEntryValue, TimelineHeaderEntry } from "../gantt/defs.ts";
    import { getGanttContext } from "../gantt-context.svelte.ts";
    import { STEP_WIDTH } from "../gantt/constants.ts";
    import { useSurface, useZoom } from "@visuallyjs/browser-ui-svelte";
	import configureHeaders from "../gantt/headers"

    let headers = $state<Array<TimelineHeaderEntry>>([])
    let dayRange = $state<number>(0)

    let ganttContext = getGanttContext();
    let gantt = $derived(ganttContext.instance);

    const surface = useSurface()
    const zoom = useZoom(surface)

    $effect(() => {
        if (gantt) {
            repaint();
            // Listen for model updates to repaint
            // In the original React code, this was bound once.
            // Using a model.bind call.
            // Note: In GanttChart.svelte, the model is _surface.current.model.
            // We should ensure we don't double bind if this effect re-runs, 
            // but gantt instance typically doesn't change once initialized.
            const model = gantt.model
            if (model) {
                model.bind(EVENT_DATA_UPDATED, repaint);
                return () => {
                    model.unbind(EVENT_DATA_UPDATED, repaint);
                }
            }
        }
    });



    function repaint() {
        if (gantt != null) {

            const dhs = configureHeaders(gantt)

            dayRange = dhs.dayRange
            gantt.headerSize = dhs.headerSize
            headers = dhs.headers
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
