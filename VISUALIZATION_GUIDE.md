# PII Guard - Advanced Risk Visualizations

## Overview

Enhanced risk data visualization system for PII Guard, providing multiple ways to understand and analyze privacy risks in documents.

## New Visualization Components

### 1. **Speedometer Gauge** (`SpeedometerGauge.jsx`)

A canvas-based speedometer visualization displaying the overall privacy risk score.

**Features:**

- **Real-time animation**: Needle smoothly moves to indicate current risk score
- **5-tier risk zones**: Color-coded segments (Safe → Critical)
- **Dynamic needle**: Changes color based on risk level
- **Legend**: Color reference for all risk levels
- **Score display**: Large, clear risk score in center

**Risk Levels:**

- 🟢 **Safe** (0-20): Green zone
- 🟡 **Low** (21-40): Yellow zone
- 🟠 **Medium** (41-60): Orange zone
- 🔴 **High** (61-80): Red zone
- 🔴 **Critical** (81-100): Dark red zone

**Color Palette:**

```
Safe: #22c55e (Green)
Low: #facc15 (Yellow)
Medium: #fb923c (Orange)
High: #ef4444 (Red)
Critical: #991b1b (Dark Red)
```

---

### 2. **Risk Breakdown Bars** (`RiskBreakdownBars.jsx`)

Animated progress bars showing the breakdown of risk by entity type.

**Features:**

- **Multi-category display**: Shows risk contribution from each PII category
- **Glowing effect**: Progress bars have shadow glow in category color
- **Percentage indicators**: Shows each category's contribution to total risk
- **Total risk summary**: Aggregates all risk weights
- **Category colors**:
  - SSN: Red (#ef4444)
  - Email: Orange (#f97316)
  - Phone: Light Orange (#fb923c)
  - Credit Card: Yellow (#eab308)
  - Password: Red (#ef4444)
  - API Key: Pink (#ec4899)
  - PII: Purple (#8b5cf6)
  - Medical: Cyan (#06b6d4)

**Use Cases:**

- Identify which PII types pose the highest risk
- Understand risk distribution across entity categories
- Prioritize redaction efforts by risk contribution

---

### 3. **Entity Heatmap** (`EntityHeatmap.jsx`)

Grid-based heatmap visualization showing risk levels for each detected entity type.

**Features:**

- **Risk cards**: One card per entity type with aggregated metrics
- **Visual heatmap**: Gradient bar showing score distribution
- **Highest-risk entity**: Shows the most risky instance per type
- **Count metrics**: Number of detected entities per type
- **Adaptive styling**: Border and background colors match risk level
- **Responsive grid**: Adapts to screen size (1, 2, or 3 columns)

**Card Information:**

- Entity type badge with risk level
- Average risk score across all instances
- Gradient bar visualization
- Count of entities
- Highest-risk individual entity preview
- Numerical risk score

**Interactive Elements:**

- Hover effects on cards
- Color-coded borders matching risk level
- Backdrop blur for depth

---

## Updated Components

### Enhanced RiskMeter (`RiskMeter.jsx`)

Now displays a 2-column layout with:

**Left Column:**

- Speedometer gauge with dynamic needle
- Risk interpretation message

**Right Column:**

- Traditional progress bar
- Risk level badge
- Allow/Block status
- Risk scale reference (5-tier color bar)

---

## Integration in App.jsx

The visualizations are displayed in this order after file analysis:

1. **RiskMeter** - Overall risk at a glance
2. **RiskBreakdownBars** - Risk by category
3. **EntityHeatmap** - Risk by entity type
4. **ExplanationPanel** - Risk reasoning
5. **EntityTable** - Detailed entity list
6. **RedactedPreview** - Processed content
7. **ActionBar** - Download/copy options

---

## Technical Implementation

### Canvas Rendering (SpeedometerGauge)

- Uses HTML5 Canvas API for performance
- Custom drawing functions for segments and needle
- Smooth animations via CSS transitions
- No external charting library required

### CSS Grid & Flexbox (RiskBreakdownBars & EntityHeatmap)

- Tailwind CSS for responsive design
- Gradient backgrounds for visual depth
- Smooth transitions (duration-700)
- Glassmorphism effects (backdrop-blur)

### Color System

All components share a unified color palette:

```javascript
const levelColors = {
  safe: "#22c55e", // Green
  low: "#facc15", // Yellow
  medium: "#fb923c", // Orange
  high: "#ef4444", // Red
  critical: "#991b1b", // Dark Red
};
```

---

## Responsive Design

**Mobile (< 768px):**

- Single column layout for RiskMeter
- Stacked visualization cards
- Full-width heatmap cards

**Tablet (768px - 1024px):**

- 2-column RiskMeter
- 2-column heatmap cards

**Desktop (> 1024px):**

- 2-column RiskMeter
- 3-column heatmap cards

---

## Performance Optimizations

1. **Canvas rendering**: Efficient redraws using requestAnimationFrame
2. **CSS animations**: GPU-accelerated transitions
3. **Conditional rendering**: Components don't render if data is missing
4. **Lazy imports**: Components loaded only when needed

---

## Future Enhancements

1. **Chart.js Integration**: Add pie charts for risk distribution
2. **Time-series Charts**: Show risk trends over multiple uploads
3. **Export Visualizations**: Save charts as PNG/SVG
4. **Interactive Tooltips**: Hover for detailed metrics
5. **Customizable Themes**: Allow dark/light mode switching
6. **Accessibility**: ARIA labels and keyboard navigation

---

## Browser Compatibility

- **Chrome/Edge**: Full support (Canvas, CSS Grid, Flexbox)
- **Firefox**: Full support
- **Safari**: Full support (iOS 14+)
- **Mobile browsers**: Full support with responsive design

---

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "gauge": "^3.0.2",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

Note: Gauge.js is installed but custom Canvas implementation is currently used for better control.

---

## Usage Example

```jsx
import RiskMeter from "./components/RiskMeter";
import RiskBreakdownBars from "./components/RiskBreakdownBars";
import EntityHeatmap from "./components/EntityHeatmap";

// In your component
<RiskMeter risk={result.decision.risk} />
<RiskBreakdownBars breakdown={result.decision.risk.breakdown} />
<EntityHeatmap entities={result.entities} />
```

---

## Troubleshooting

**Gauge not rendering:**

- Check if Canvas is supported in browser
- Verify risk score is a number 0-100

**Heatmap showing no cards:**

- Ensure entities array is not empty
- Verify entity objects have `label`, `score`, and `text` properties

**Progress bars not animated:**

- Check Tailwind CSS is properly configured
- Verify breakdown object is not empty

---

## Design Principles

1. **At-a-glance understanding**: Users should understand risk level immediately
2. **Color consistency**: Same risk level = same color across all visualizations
3. **Progressive disclosure**: High-level overview first, detailed info on demand
4. **Performance**: Smooth animations without lag
5. **Accessibility**: Clear labels and high contrast colors

---

## Version History

- **v1.0.0** (2026-04-23): Initial release
  - Speedometer gauge
  - Risk breakdown bars
  - Entity heatmap
  - Integrated with RiskMeter

---

## Support

For issues or feature requests, please refer to the main PII Guard documentation.
