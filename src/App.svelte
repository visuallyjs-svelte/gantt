<script lang="ts">
import { SurfaceProvider } from '@visuallyjs/browser-ui-svelte'
import GanttChart from './GanttChart.svelte'
import GanttControls from './GanttControls.svelte'
import GanttInspector from './GanttInspector.svelte'

import './gantt.css'
</script>

<div class="vjs-gantt-main">
    <SurfaceProvider>
        <GanttControls/>
        <div class="vjs-gantt-body" style="display:flex;flex-grow:1">
            <GanttChart/>
            <GanttInspector/>
        </div>
    </SurfaceProvider>
</div>
