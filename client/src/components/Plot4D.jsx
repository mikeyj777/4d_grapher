// Plot4D.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, Slider, Label, Section } from './ui/ui';

const Plot4D = () => {
  const [rotateX, setRotateX] = useState(45);
  const [rotateY, setRotateY] = useState(45);
  const [rotateZ, setRotateZ] = useState(0);
  const [timeSlice, setTimeSlice] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  
  const [baseRippleAmp, setBaseRippleAmp] = useState(0.3);
  const [xWaveAmp, setXWaveAmp] = useState(0.2);
  const [yWaveAmp, setYWaveAmp] = useState(0.2);
  const [spiralAmp, setSpiralAmp] = useState(0.3);
  const [spiralDamping, setSpiralDamping] = useState(0.1);
  const [checkerAmp, setCheckerAmp] = useState(0.2);
  
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    // Create a ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const points = useMemo(() => {
    const result = [];
    const steps = 15;
    const scale = dimensions.width / 6;
    
    for (let x = -2; x <= 2; x += 4/steps) {
      for (let y = -2; y <= 2; y += 4/steps) {
        const t = timeSlice * 2 * Math.PI / 100;
        const z = 
          Math.sin(Math.sqrt(x*x + y*y)) * baseRippleAmp +
          Math.sin(2*x + t) * xWaveAmp +
          Math.cos(2*y - t) * yWaveAmp +
          Math.sin(Math.atan2(y, x) + t) * Math.exp(-spiralDamping * (x*x + y*y)) * spiralAmp +
          Math.cos(t) * Math.sin(x*y) * checkerAmp;

        result.push({
          x: x * scale,
          y: y * scale,
          z: z * scale * 1.5
        });
      }
    }
    return result;
  }, [dimensions.width, timeSlice, baseRippleAmp, xWaveAmp, yWaveAmp, spiralAmp, spiralDamping, checkerAmp]);

  const project = (point) => {
    const rad = Math.PI / 180;
    const cx = Math.cos(rotateX * rad);
    const sx = Math.sin(rotateX * rad);
    const cy = Math.cos(rotateY * rad);
    const sy = Math.sin(rotateY * rad);
    const cz = Math.cos(rotateZ * rad);
    const sz = Math.sin(rotateZ * rad);

    let x1 = point.x;
    let y1 = point.y * cx - point.z * sx;
    let z1 = point.y * sx + point.z * cx;

    let x2 = x1 * cy + z1 * sy;
    let y2 = y1;
    let z2 = -x1 * sy + z1 * cy;

    let x3 = x2 * cz - y2 * sz;
    let y3 = x2 * sz + y2 * cz;

    const scale = dimensions.width / (dimensions.width + z2);
    return {
      x: x3 * scale + dimensions.width/2,
      y: y3 * scale + dimensions.height/2,
      z: z2
    };
  };

  const projectedPoints = points.map(project);

  const triangles = [];
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const idx = i * (steps + 1) + j;
      if (i < steps - 1 && j < steps) {
        triangles.push([
          projectedPoints[idx],
          projectedPoints[idx + 1],
          projectedPoints[idx + steps + 1]
        ]);
        triangles.push([
          projectedPoints[idx + 1],
          projectedPoints[idx + steps + 2],
          projectedPoints[idx + steps + 1]
        ]);
      }
    }
  }

  const ParameterControl = ({ label, value, onChange, min, max, step }) => (
    <div className="parameter-control">
      <Label>{label}: {value.toFixed(2)}</Label>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );

  return (
    <div className="plot-container">
      <div className="visualization-panel">
        <Card className="visualization-container">
          <CardContent className="visualization-container">
            <div ref={containerRef} className="visualization-container">
              <svg 
                width={dimensions.width} 
                height={dimensions.height} 
                className="plot-svg"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              >
                {triangles.map((triangle, i) => (
                  <polygon
                    key={i}
                    points={`${triangle[0].x},${triangle[0].y} ${triangle[1].x},${triangle[1].y} ${triangle[2].x},${triangle[2].y}`}
                    className="surface-polygon"
                    style={{
                      fill: `rgb(${Math.floor(255 * (1 - triangle[0].z/200))}, ${Math.floor(255 * (1 - triangle[0].z/200))}, 255)`,
                    }}
                  />
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="controls-panel">
        <Section title="Wave Parameters">
          <ParameterControl
            label="Base Ripple Amplitude"
            value={baseRippleAmp}
            onChange={value => setBaseRippleAmp(value[0])}
            min={0}
            max={1}
            step={0.05}
          />
          <ParameterControl
            label="X Wave Amplitude"
            value={xWaveAmp}
            onChange={value => setXWaveAmp(value[0])}
            min={0}
            max={1}
            step={0.05}
          />
          <ParameterControl
            label="Y Wave Amplitude"
            value={yWaveAmp}
            onChange={value => setYWaveAmp(value[0])}
            min={0}
            max={1}
            step={0.05}
          />
          <ParameterControl
            label="Spiral Amplitude"
            value={spiralAmp}
            onChange={value => setSpiralAmp(value[0])}
            min={0}
            max={1}
            step={0.05}
          />
          <ParameterControl
            label="Spiral Damping"
            value={spiralDamping}
            onChange={value => setSpiralDamping(value[0])}
            min={0}
            max={0.5}
            step={0.01}
          />
          <ParameterControl
            label="Checker Amplitude"
            value={checkerAmp}
            onChange={value => setCheckerAmp(value[0])}
            min={0}
            max={1}
            step={0.05}
          />
        </Section>

        <Section title="View Controls">
          <ParameterControl
            label="Time Slice"
            value={timeSlice}
            onChange={value => setTimeSlice(value[0])}
            min={0}
            max={100}
            step={1}
          />
          <ParameterControl
            label="Rotate X"
            value={rotateX}
            onChange={value => setRotateX(value[0])}
            min={0}
            max={360}
            step={1}
          />
          <ParameterControl
            label="Rotate Y"
            value={rotateY}
            onChange={value => setRotateY(value[0])}
            min={0}
            max={360}
            step={1}
          />
          <ParameterControl
            label="Rotate Z"
            value={rotateZ}
            onChange={value => setRotateZ(value[0])}
            min={0}
            max={360}
            step={1}
          />
        </Section>
      </div>
    </div>
  );
};

export default Plot4D;