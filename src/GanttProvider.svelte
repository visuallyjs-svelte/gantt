<script lang="ts">
	
    import { setGanttContext } from "./gantt-context.svelte";
    import {SurfaceProvider} from "@visuallyjs/browser-ui-svelte";

    let { children } = $props();

    // Create the context container once at the parent level
    setGanttContext();

</script>

<SurfaceProvider>
{@render children()}
</SurfaceProvider>
