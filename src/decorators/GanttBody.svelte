<script lang="ts">
    import { DecoratorComponent } from "@visuallyjs/browser-ui-svelte";
    import { getGanttContext } from "../gantt-context.svelte";
    import {type DayEntry} from "../gantt/defs";

    const gantt = getGanttContext()

    let days = $state<Array<DayEntry>>([])
    let rightNowLine = $state<number>(0)

    function repaint() {
        if (gantt.instance != null) {
            days = gantt.instance.days
			rightNowLine = gantt.instance.rightNow
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
    <DecoratorComponent placement="fixed" position={{x:0, y:0}}>
        <div class="vjs-gantt-day-stripes">
            {#each days as day (day.id)}
                <div class={day.clazz} style="flex-basis:{day.size}px; height:{day.height}px"></div>
            {/each}
        </div>
    </DecoratorComponent>
    <DecoratorComponent placement="fixed" position={{x:0, y:0}}>
        <div class="vjs-gantt-right-now" style="left:{rightNowLine}px; height:{gantt.instance.model.getNodes().length * gantt.instance.rowHeight}px"></div>
    </DecoratorComponent>
{/if}
