<script lang="ts">


    import { setGanttContext } from "./gantt-context.svelte";

    let { children } = $props();

    // Create the context container once at the parent level
    setGanttContext();

</script>

{@render children()}
