# 03. Liquid & Lava Effects Specification

The **Wildfire Docs Platform** features signature dynamic liquid fire animations implemented in [`components/ui/LiquidEffects.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/ui/LiquidEffects.tsx).

---

## 🌋 1. Molten Lava Tank (Sidebar Wave Tank)

Located in the bottom of the sidebar navigation. It consists of **4 distinct SVG animated fluid wave layers** + **floating rising ember particles**.

### SVG Gradient Layers:
1. **Layer 1 (Deep Magma Bed)**:
   - Gradient: `hsl(8, 90%, 26%)` → `hsl(16, 95%, 34%)` → `hsl(24, 100%, 42%)` (opacity 0.95)
   - Animation: `lavaFlow1 11s ease-in-out infinite`
2. **Layer 2 (Liquid Fire Middle)**:
   - Gradient: `hsl(20, 100%, 44%)` → `hsl(28, 100%, 50%)` → `hsl(36, 100%, 54%)` (opacity 0.80)
   - Animation: `lavaFlow2 8s ease-in-out infinite 0.6s`
3. **Layer 3 (Amber Swell Crest)**:
   - Gradient: `hsl(32, 100%, 52%)` → `hsl(44, 100%, 58%)` (opacity 0.65)
   - Animation: `lavaFlow3 6s ease-in-out infinite 1.2s`
4. **Layer 4 (Golden Incandescent Froth Tip)**:
   - Gradient: `hsl(44, 100%, 65%)` → `hsl(52, 100%, 75%)` (opacity 0.45)
   - Animation: `lavaFlow4 4.5s ease-in-out infinite 0.3s`

### Floating Ember Particles:
- 3 micro particle circles floating upwards with subtle horizontal jitter (`emberRise1`, `emberRise2`, `emberRise3`).
- Particle colors: `hsl(44 100% 60%)`, `hsl(26 100% 55%)`, `hsl(38 100% 65%)` with glowing `box-shadow: 0 0 6px ...`.

### Keyframe Code:
```css
@keyframes lavaFlow1 {
  0%, 100% { d: path("M0,100 L0,30 C180,18 360,42 540,28 C720,16 900,38 1080,24 C1260,14 1350,32 1440,25 L1440,100 Z"); }
  50%       { d: path("M0,100 L0,38 C180,26 360,16 540,36 C720,28 900,16 1080,34 C1260,26 1350,18 1440,32 L1440,100 Z"); }
}

@keyframes emberRise1 {
  0%   { transform: translateY(0px) translateX(0px) scale(0.8); opacity: 0; }
  30%  { opacity: 0.8; }
  80%  { opacity: 0.6; }
  100% { transform: translateY(-55px) translateX(12px) scale(0.3); opacity: 0; }
}
```

---

## 🌌 2. Ambient Liquid Glow Background

Rendered globally via `<LiquidBackground />`:
- Fixed full-screen container (`pointer-events: none`, `z-index: 0`).
- 3 large drifting radial gradient blobs:
  - **Blob 1 (Primary Fire)**: `radial-gradient(ellipse 600px 500px at center, hsl(26 100% 52% / 0.08) 0%, transparent 70%)` (Bottom Left, 22s drift cycle).
  - **Blob 2 (Deep Ember)**: `radial-gradient(ellipse 500px 400px at center, hsl(8 90% 45% / 0.06) 0%, transparent 70%)` (Top Right, 30s drift cycle).
  - **Blob 3 (Warm Amber)**: `radial-gradient(ellipse 400px 300px at center, hsl(38 100% 52% / 0.05) 0%, transparent 70%)` (Center, 40s drift cycle).
- Overlay Vignette: Dark radial gradient masking the edges to prevent eye fatigue.

---

## 🌟 3. Card & Component Aurora Light Beams

All interactive cards, callout boxes, and navigation items feature **top light beams**:

```css
/* Aurora top beam pseudo-element */
.component::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, hsl(26 100% 54% / 0.8) 30%, hsl(44 100% 58% / 0.9) 50%, hsl(26 100% 54% / 0.8) 70%, transparent 100%);
  opacity: 0.7;
  pointer-events: none;
}
```
Hovering increases beam opacity and delivers a restrained warm ambient glow.
