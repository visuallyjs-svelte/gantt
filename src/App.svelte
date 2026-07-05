<script lang="ts">
import { SurfaceProvider } from '@visuallyjs/browser-ui-svelte'
import GanttChart from './GanttChart.svelte'
import GanttControls from './GanttControls.svelte'
import GanttProvider from "./GanttProvider.svelte"

import './gantt.css'
import GanttLabels from "./decorators/GanttLabels.svelte";
import GanttHeaders from "./decorators/GanttHeaders.svelte";
</script>

<div class="vjs-gantt-main">
    <SurfaceProvider>
		<GanttProvider>
        <GanttControls/>
        <div class="vjs-gantt-body">
			<GanttLabels/>
			<div class="vjs-gantt-body-content">
				<GanttHeaders/>
				<GanttChart/>
			</div>
        </div>
		</GanttProvider>
    </SurfaceProvider>
</div>
