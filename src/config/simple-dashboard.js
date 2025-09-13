// Very simple dashboard component for testing
import React from 'react';

const SimpleDashboard = () => {
  console.log('🎯 SimpleDashboard component rendered!');
  return React.createElement('div', { 
    style: { 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '10px',
      textAlign: 'center'
    }
  },
    React.createElement('h1', { style: { margin: '0 0 10px 0' } }, '🎯 CUSTOM DASHBOARD WORKING!'),
    React.createElement('p', { style: { margin: '0' } }, 'This is a custom dashboard component!')
  );
};

export default SimpleDashboard;
