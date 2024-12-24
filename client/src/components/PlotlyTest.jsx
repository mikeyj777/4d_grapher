import React from 'react';
import Plot from 'react-plotly.js';

const PlotlyTest = () => {
  // Simple data for testing
  const plotData = [{
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
    type: 'scatter',
    mode: 'lines+markers',
    marker: {
      color: '#4299e1'
    }
  }];

  const layout = {
    autosize: true,
    title: 'Basic Plotly Test',
    margin: { l: 50, r: 50, b: 50, t: 50 }
  };

  const style = { width: '100%', height: '500px' };

  return (
    <div style={{ padding: '20px' }}>
      <Plot
        data={plotData}
        layout={layout}
        style={style}
        useResizeHandler={true}
      />
    </div>
  );
};

export default PlotlyTest;