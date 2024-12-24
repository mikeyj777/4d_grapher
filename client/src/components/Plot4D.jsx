import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { create, all } from 'mathjs';

// Configure mathjs
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
  
  // Range states
  const [xRange, setXRange] = useState([-2, 2]);
  const [yRange, setYRange] = useState([-2, 2]);
  const [tRange, setTRange] = useState([0, 2 * Math.PI]);

  const evaluateFunction = useCallback((x, y, t, fn) => {
    try {
      const scope = { x, y, t };
      return limitedEval(fn, scope);
    } catch (err) {
      return 0;
    }
  }, []);

  const generatePlotData = useCallback((fn, time) => {
    try {
      const steps = 50;
      const t = tRange[0] + (time / 100) * (tRange[1] - tRange[0]);
      
      // Generate vertices
      const x = [];
      const y = [];
      const z = [];
      
      // Create vertices in a grid pattern for surface plot
      for (let i = 0; i <= steps; i++) {
        const row_x = [];
        const row_y = [];
        const row_z = [];
        
        for (let j = 0; j <= steps; j++) {
          const xVal = xRange[0] + (i / steps) * (xRange[1] - xRange[0]);
          const yVal = yRange[0] + (j / steps) * (yRange[1] - yRange[0]);
          const zVal = evaluateFunction(xVal, yVal, t, fn);
          
          row_x.push(xVal);
          row_y.push(yVal);
          row_z.push(zVal);
        }
        
        x.push(row_x);
        y.push(row_y);
        z.push(row_z);
      }

      return [{
        type: 'surface',
        x: x,
        y: y,
        z: z,
        colorscale: 'Viridis',
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "#42f462",
            project: { z: true }
          }
        }
      }];
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [evaluateFunction, xRange, yRange, tRange]);

  // Update plot data when function, time, or ranges change
  React.useEffect(() => {
    const newData = generatePlotData(functionString, timeSlice);
    if (newData) {
      setPlotData(newData);
      setError('');
    }
  }, [functionString, timeSlice, generatePlotData]);

  const layout = {
    scene: {
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      xaxis: { range: xRange },
      yaxis: { range: yRange },
      zaxis: { range: [-2, 2] },
      aspectratio: { x: 1, y: 1, z: 1 }
    },
    autosize: true,
    title: '4D Surface Plot',
    margin: { l: 0, r: 0, b: 0, t: 30 }
  };

  const handleRangeChange = (setter) => (e, index) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setter(prev => {
        const newRange = [...prev];
        newRange[index] = value;
        return newRange;
      });
    }
  };

  const handleFunctionChange = (e) => {
    setFunctionString(e.target.value);
  };

  const handleTimeSliceChange = (e) => {
    setTimeSlice(parseInt(e.target.value));
  };

  return (
    <div className="plot-container">
      {/* Plot Panel */}
      <div className="visualization-panel">
        <div className="visualization-container">
          {plotData && (
            <Plot
              data={plotData}
              layout={layout}
              className="plot-svg"
              useResizeHandler={true}
              config={{
                displayModeBar: true,
                scrollZoom: true
              }}
            />
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="section">
          <h3 className="section-title">Plot Controls</h3>
          
          <div className="section-content">
            <div className="parameter-control">
              <label className="label">Function:</label>
              <textarea
                className="function-input"
                value={functionString}
                onChange={handleFunctionChange}
              />
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            <div className="parameter-control">
              <label className="label">X Range:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={xRange[0]}
                  onChange={(e) => handleRangeChange(setXRange)(e, 0)}
                  className="range-input"
                  step="0.1"
                />
                <span>to</span>
                <input
                  type="number"
                  value={xRange[1]}
                  onChange={(e) => handleRangeChange(setXRange)(e, 1)}
                  className="range-input"
                  step="0.1"
                />
              </div>
            </div>

            <div className="parameter-control">
              <label className="label">Y Range:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={yRange[0]}
                  onChange={(e) => handleRangeChange(setYRange)(e, 0)}
                  className="range-input"
                  step="0.1"
                />
                <span>to</span>
                <input
                  type="number"
                  value={yRange[1]}
                  onChange={(e) => handleRangeChange(setYRange)(e, 1)}
                  className="range-input"
                  step="0.1"
                />
              </div>
            </div>

            <div className="parameter-control">
              <label className="label">T Range:</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={tRange[0]}
                  onChange={(e) => handleRangeChange(setTRange)(e, 0)}
                  className="range-input"
                  step="0.1"
                />
                <span>to</span>
                <input
                  type="number"
                  value={tRange[1]}
                  onChange={(e) => handleRangeChange(setTRange)(e, 1)}
                  className="range-input"
                  step="0.1"
                />
              </div>
            </div>

            <div className="parameter-control">
              <label className="label">Time Slice: {timeSlice}</label>
              <div className="slider-container">
                <div className="slider-track"></div>
                <input
                  type="range"
                  className="slider"
                  min={0}
                  max={100}
                  value={timeSlice}
                  onChange={handleTimeSliceChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plot4D;