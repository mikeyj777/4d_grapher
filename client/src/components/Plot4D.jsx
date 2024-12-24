import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Slider, Label, Section } from './ui/ui';
import Plot from 'react-plotly.js';
import { create, all } from 'mathjs';

const math = create(all);
const limitedEval = math.evaluate;
math.import({
  import: function () { throw new Error('Function import is disabled') },
  createUnit: function () { throw new Error('Function createUnit is disabled') },
  evaluate: function () { throw new Error('Function evaluate is disabled') },
  parse: function () { throw new Error('Function parse is disabled') },
  simplify: function () { throw new Error('Function simplify is disabled') },
  derivative: function () { throw new Error('Function derivative is disabled') }
}, { override: true });

const Plot4D = () => {
  const [timeSlice, setTimeSlice] = useState(0);
  const [functionString, setFunctionString] = useState('sin(sqrt(x*x + y*y)) * 0.3 + sin(2*x + t) * 0.2');
  const [error, setError] = useState('');
  const [plotData, setPlotData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
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
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const evaluateFunction = (x, y, t) => {
    try {
      const scope = { x, y, t };
      return limitedEval(functionString, scope);
    } catch (err) {
      setError(err.message);
      return 0;
    }
  };

  useEffect(() => {
    const generatePlotData = () => {
      const steps = 50;
      const t = timeSlice * 2 * Math.PI / 100;
      
      // Generate vertices
      const x = [];
      const y = [];
      const z = [];
      
      // Create vertices
      for (let i = 0; i <= steps; i++) {
        for (let j = 0; j <= steps; j++) {
          const xVal = -2 + (4 * i) / steps;
          const yVal = -2 + (4 * j) / steps;
          const zVal = evaluateFunction(xVal, yVal, t);
          
          x.push(xVal);
          y.push(yVal);
          z.push(zVal);
        }
      }

      console.log('Generated plot data:', {
        x: x.slice(0, 5),
        y: y.slice(0, 5),
        z: z.slice(0, 5),
        length: x.length
      });

      return [{
        type: 'mesh3d',
        x: x,
        y: y,
        z: z,
        colorscale: 'Viridis',
        intensity: z,
        hoverinfo: 'x+y+z+text',
        text: Array(x.length).fill(''),
      }];
    };

    setPlotData(generatePlotData());
  }, [timeSlice, functionString]);

  const layout = {
    title: '4D Mesh Plot',
    autosize: true,
    height: dimensions.height || 600,
    scene: {
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      xaxis: { range: [-2, 2] },
      yaxis: { range: [-2, 2] },
      zaxis: { range: [-2, 2] },
      aspectratio: { x: 1, y: 1, z: 1 }
    },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 30
    }
  };

  return (
    <div className="plot-container">
      <div className="visualization-panel">
        <Card className="visualization-container">
          <CardContent>
            <div className="plot-wrapper" ref={containerRef}>
              {console.log('Plot data being sent:', plotData)}
              {plotData && (
                <Plot
                  data={plotData}
                  layout={layout}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    scrollZoom: true,
                    toImageButtonOptions: {
                      format: 'png',
                      filename: 'plot',
                      height: dimensions.height,
                      width: dimensions.width,
                      scale: 1,
                    },
                    setBackground: 'transparent',
                    plotGlPixelRatio: devicePixelRatio,
                    useResizeHandler: true,
                    modeBarButtonsToRemove: ['sendDataToCloud']
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="controls-panel">
        <Section title="Function">
          <div className="parameter-control">
            <Label>Surface Function (variables: x, y, t)</Label>
            <textarea
              value={functionString}
              onChange={(e) => {
                setFunctionString(e.target.value);
                setError('');
              }}
              className="function-input"
              rows={4}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        </Section>

        <Section title="Animation Controls">
          <div className="parameter-control">
            <Label>Time Slice: {timeSlice}</Label>
            <Slider
              value={[timeSlice]}
              onValueChange={(value) => setTimeSlice(value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Plot4D;