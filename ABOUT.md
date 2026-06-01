### Summary
This demo implements a Gantt chart for project management. It uses the flexible VisuallyJS surface to render tasks, task groups, and milestones on a timeline.

### Components Used
- `SurfaceProvider`: Context provider.
- `SurfaceComponent`: (In `GanttChart.svelte`) The main timeline canvas.
- `ControlsComponent`: (In `GanttControls.svelte`) Custom controls for the Gantt chart.
- `InspectorComponent`: (In `GanttInspector.svelte`) Used for task details.

### Component Options
#### `SurfaceComponent`
- `renderOptions`: Heavily customized for timeline and task rendering.
- `viewOptions`: Configured for horizontal scrolling and timeline scaling.
- `modelOptions`: Used for managing task data.
- `className`: CSS class for the Gantt canvas.

### Stylesheet Requirement
Include `visuallyjs.css` for proper rendering.

```css
@import "@visuallyjs/browser-ui/css/visuallyjs.css";
```
