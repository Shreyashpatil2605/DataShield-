# Risk Visualizations - Implementation & Testing Guide

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SpeedometerGauge.jsx      (NEW) Canvas gauge visualization
│   │   ├── RiskBreakdownBars.jsx     (NEW) Progress bar breakdown
│   │   ├── EntityHeatmap.jsx         (NEW) Heatmap grid view
│   │   ├── RiskMeter.jsx             (UPDATED) Now includes speedometer
│   │   ├── EntityTable.jsx           (existing)
│   │   ├── ExplanationPanel.jsx      (existing)
│   │   ├── RedactedPreview.jsx       (existing)
│   │   ├── ActionBar.jsx             (existing)
│   │   ├── DropZone.jsx              (existing)
│   │   └── index.jsx                 (existing)
│   ├── App.jsx                        (UPDATED) Imports new components
│   ├── main.jsx                       (existing)
│   └── index.css                      (existing)
├── package.json                       (UPDATED) Added chart libraries
├── vite.config.js                     (existing)
└── tailwind.config.js                 (existing)
```

---

## Component Specifications

### 1. SpeedometerGauge.jsx

**Props:**

```javascript
{
  score: number,        // 0-100 (required)
  level: string        // 'safe'|'low'|'medium'|'high'|'critical' (required)
}
```

**State:**

- Uses `useRef` for Canvas reference
- Renders on score/level change

**Exports:**

```javascript
export default function SpeedometerGauge({ score, level })
```

**Testing:**

```javascript
// Test component
import SpeedometerGauge from './SpeedometerGauge';

// Test case 1: Safe score
<SpeedometerGauge score={15} level="safe" />

// Test case 2: Critical score
<SpeedometerGauge score={95} level="critical" />

// Test case 3: Medium score
<SpeedometerGauge score={50} level="medium" />
```

**Dependencies:**

- React (useEffect, useRef)
- HTML5 Canvas API

---

### 2. RiskBreakdownBars.jsx

**Props:**

```javascript
{
  breakdown: object; // { category: points, ... } or null
}
```

**Internal Logic:**

- Calculates max value for scaling
- Maps categories to colors
- Formats category labels
- Shows percentage of total

**Example Input:**

```javascript
{
  ssn: 8,
  email: 5,
  phone: 3,
  credit_card: 2
}
```

**Exports:**

```javascript
export default function RiskBreakdownBars({ breakdown })
```

**Testing:**

```javascript
import RiskBreakdownBars from './RiskBreakdownBars';

// Test case 1: Full breakdown
<RiskBreakdownBars breakdown={{
  ssn: 8,
  email: 5,
  phone: 3
}} />

// Test case 2: Empty breakdown
<RiskBreakdownBars breakdown={{}} />

// Test case 3: Single category
<RiskBreakdownBars breakdown={{ ssn: 10 }} />
```

**Dependencies:**

- React (none, functional component)
- Tailwind CSS

---

### 3. EntityHeatmap.jsx

**Props:**

```javascript
{
  entities: array; // [{label, score, text, source}, ...] or null
}
```

**Data Processing:**

- Groups entities by label
- Calculates average score per label
- Finds highest-risk entity per label
- Determines risk level from score

**Example Input:**

```javascript
[
  { label: "SSN", score: 0.92, text: "123-45-6789", source: "text" },
  { label: "EMAIL", score: 0.58, text: "user@example.com", source: "ocr" },
  { label: "PHONE", score: 0.15, text: "(555) 123-4567", source: "text" },
];
```

**Exports:**

```javascript
export default function EntityHeatmap({ entities })
```

**Testing:**

```javascript
import EntityHeatmap from './EntityHeatmap';

// Test case 1: Multiple entities
<EntityHeatmap entities={[
  {label: "SSN", score: 0.92, text: "123-45-6789"},
  {label: "EMAIL", score: 0.58, text: "test@example.com"}
]} />

// Test case 2: Empty entities
<EntityHeatmap entities={[]} />

// Test case 3: Single entity type
<EntityHeatmap entities={[
  {label: "SSN", score: 0.75, text: "123-45-6789"}
]} />
```

**Dependencies:**

- React (no hooks used)
- Tailwind CSS

---

### 4. Updated RiskMeter.jsx

**Props:**

```javascript
{
  risk: object; // {score, level, message, allowed, breakdown}
}
```

**Layout Changes:**

- Now 2-column layout on desktop (grid-cols-1 lg:grid-cols-2)
- Left: Speedometer gauge
- Right: Traditional progress bar + stats

**New Imports:**

```javascript
import SpeedometerGauge from "./SpeedometerGauge";
```

**Testing:**

```javascript
import RiskMeter from "./RiskMeter";

const mockRisk = {
  score: 75,
  level: "high",
  message: "High PII content detected",
  allowed: false,
  breakdown: { ssn: 8, email: 5 },
};

<RiskMeter risk={mockRisk} />;
```

---

## Integration in App.jsx

**New Imports:**

```javascript
import RiskBreakdownBars from "./components/RiskBreakdownBars";
import EntityHeatmap from "./components/EntityHeatmap";
```

**New Render Order:**

```javascript
{
  result && (
    <>
      <RiskMeter risk={result.decision.risk} />
      <RiskBreakdownBars breakdown={result.decision.risk.breakdown} />
      <EntityHeatmap entities={result.entities} />
      {/* existing components */}
    </>
  );
}
```

---

## Testing Checklist

### Unit Tests

- [ ] SpeedometerGauge renders canvas element
- [ ] Needle updates when score changes
- [ ] Color changes with risk level
- [ ] RiskBreakdownBars displays all categories
- [ ] Progress bars animate smoothly
- [ ] EntityHeatmap groups entities by label
- [ ] Cards display correct risk levels
- [ ] Heatmap shows highest-risk entity

### Integration Tests

- [ ] App imports all visualization components
- [ ] Components render in correct order
- [ ] Data flows correctly from API to visualizations
- [ ] No console errors

### Visual Tests

- [ ] Gauge needle animates smoothly
- [ ] Colors match design spec
- [ ] Text is readable and properly sized
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Animations don't cause jank

### Accessibility Tests

- [ ] Color-blind safe palette
- [ ] Sufficient contrast ratios
- [ ] Keyboard navigable
- [ ] Screen reader friendly

### Performance Tests

- [ ] Initial render < 100ms
- [ ] Animations 60fps
- [ ] Memory usage < 5MB
- [ ] No memory leaks

---

## Mock Data for Testing

```javascript
// Complete mock result from API
const mockAnalysisResult = {
  decision: {
    risk: {
      score: 75,
      level: "high",
      message:
        "High PII content detected. This document contains sensitive information.",
      allowed: false,
      breakdown: {
        ssn: 10,
        email: 8,
        phone: 5,
        credit_card: 3,
        password: 2,
      },
    },
    reasons: ["Contains 2 SSN numbers", "Contains email addresses"],
  },
  entities: [
    {
      label: "SSN",
      text: "123-45-6789",
      source: "text",
      score: 0.92,
    },
    {
      label: "EMAIL",
      text: "john.doe@company.com",
      source: "text",
      score: 0.85,
    },
    {
      label: "PHONE",
      text: "(555) 123-4567",
      source: "ocr",
      score: 0.78,
    },
    {
      label: "CREDIT_CARD",
      text: "4532015112830366",
      source: "text",
      score: 0.95,
    },
  ],
  redacted_text: "[SSN] hired [EMAIL] at [PHONE] with card [CREDIT_CARD]",
  filename: "document.txt",
  explanations: {},
};
```

---

## Development Workflow

### 1. **Local Development**

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### 2. **Testing Components**

Create test files in `frontend/src/components/__tests__/`:

```bash
SpeedometerGauge.test.jsx
RiskBreakdownBars.test.jsx
EntityHeatmap.test.jsx
```

### 3. **Building for Production**

```bash
npm run build
npm run preview
```

### 4. **Performance Profiling**

```javascript
// Add to component
console.time("SpeedometerGauge");
// component code
console.timeEnd("SpeedometerGauge");
```

---

## Common Customizations

### 1. Change Risk Level Thresholds

**File:** Each component has risk level logic

**Example:** Change medium threshold from 60 to 50

```javascript
// Before
if (percentage <= 60) return { level: "medium", ... }

// After
if (percentage <= 50) return { level: "medium", ... }
```

### 2. Add New Entity Types

**File:** EntityHeatmap.jsx

```javascript
// In EntityHeatmap component, add to categoryColors
const categoryColors = {
  // ... existing
  driver_license: "#14b8a6", // New
  passport: "#06b6d4", // New
};
```

### 3. Modify Gauge Size

**File:** SpeedometerGauge.jsx

```javascript
// Change canvas dimensions
<canvas
  ref={canvasRef}
  width={280} // Change width
  height={180} // Change height
/>
```

### 4. Update Color Scheme

**Files:** All components

```javascript
// Global color constants (consider extracting to constants.js)
const COLOR_SAFE = "#22c55e";
const COLOR_LOW = "#facc15";
// ... etc
```

---

## Debugging Guide

### Issue: Canvas appears blank

**Causes:**

- Browser doesn't support Canvas
- Score/level props are invalid
- useEffect not triggering

**Debug:**

```javascript
useEffect(() => {
  console.log("Rendering gauge:", score, level);
  // ... rendering code
}, [score, level]);
```

### Issue: Progress bars not animating

**Causes:**

- Tailwind CSS not loaded
- Duration class not applied
- Breakdown object is empty

**Debug:**

```javascript
console.log("Breakdown:", breakdown);
console.log("Max value:", Math.max(...Object.values(breakdown)));
```

### Issue: Heatmap cards overlapping

**Causes:**

- Grid gap too small
- Responsive classes not working
- Content too wide

**Debug:**

```javascript
// Check computed grid columns
const elements = document.querySelectorAll(".grid");
elements.forEach((el) => {
  console.log(window.getComputedStyle(el).gridTemplateColumns);
});
```

---

## Performance Optimization Tips

1. **Use React.memo** for expensive components

```javascript
export default React.memo(EntityHeatmap);
```

2. **Lazy load visualizations**

```javascript
const SpeedometerGauge = lazy(() => import("./SpeedometerGauge"));
```

3. **Debounce canvas redrawing**

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    // render
  }, 100);
  return () => clearTimeout(timer);
}, [score]);
```

4. **Minimize re-renders**

```javascript
// Use useCallback for event handlers
const handleChange = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## Browser DevTools Tips

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Record while uploading file
4. Look for janky animations (red bars)
5. Check memory usage in Memory tab

### Canvas Debugging

1. Right-click canvas element
2. Inspect element
3. Check canvas resolution vs display size
4. Monitor WebGL in chrome://gpu

---

## Version Compatibility

| Package         | Version | Purpose                     |
| --------------- | ------- | --------------------------- |
| React           | ^18.2.0 | UI Framework                |
| React-DOM       | ^18.2.0 | DOM Rendering               |
| Vite            | ^4.4.0  | Build Tool                  |
| Tailwind CSS    | ^3.3.0  | Styling                     |
| Chart.js        | ^4.4.1  | (Future) Charts             |
| react-chartjs-2 | ^5.2.0  | (Future) React Integration  |
| Gauge           | ^3.0.2  | (Alternative) Gauge Library |

---

## Rollback Instructions

If visualizations cause issues:

1. **Remove imports from App.jsx**

```javascript
// Comment out new imports
// import RiskBreakdownBars from "./components/RiskBreakdownBars";
// import EntityHeatmap from "./components/EntityHeatmap";
```

2. **Remove from render**

```javascript
{
  result && (
    <>
      <RiskMeter risk={result.decision.risk} />
      {/* <RiskBreakdownBars ... /> */}
      {/* <EntityHeatmap ... /> */}
    </>
  );
}
```

3. **Revert RiskMeter.jsx**

```bash
git checkout src/components/RiskMeter.jsx
```

4. **Remove new component files**

```bash
rm src/components/SpeedometerGauge.jsx
rm src/components/RiskBreakdownBars.jsx
rm src/components/EntityHeatmap.jsx
```

---

## Support & Documentation

- Main docs: [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md)
- Quick reference: [VISUALIZATION_QUICK_REFERENCE.md](./VISUALIZATION_QUICK_REFERENCE.md)
- API docs: See README.md
- Component docs: Check JSDoc comments in each file

---

**Last Updated:** April 23, 2026
**Maintainer:** PII Guard Team
