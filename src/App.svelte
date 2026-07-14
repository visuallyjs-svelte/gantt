<script lang="ts">
import GanttChart from './GanttChart.svelte'
import GanttControls from './GanttControls.svelte'
import GanttProvider from "./GanttProvider.svelte"

import './gantt.css'
import GanttLabels from "./decorators/GanttLabels.svelte";
import GanttHeaders from "./decorators/GanttHeaders.svelte";
import GanttBodyDecorator from "./decorators/GanttBody.svelte"
</script>

<div class="vjs-gantt-main">
	<GanttProvider>
        <GanttControls/>
        <div class="vjs-gantt-body">
			<GanttLabels/>
			<div class="vjs-gantt-body-content">
				<GanttHeaders/>
				<GanttChart/>
			</div>
			<GanttBodyDecorator/>
        </div>
	</GanttProvider>
</div>
