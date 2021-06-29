import React from 'react';
import {StaticMathField, addStyles} from 'react-mathquill';

addStyles();

const StaticMathComponent = ({string}) => {
  return (
    <div className="container static-math-container">
      <StaticMathField></StaticMathField>
    </div>
  )
}




export default StaticMathComponent;