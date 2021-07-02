import React, { useState } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';





addStyles();

const MainInput = (props) => {

  const [latex, setLatex] = useState('');
  const [unitLatex, setUnitLatex] = useState('');



  return (
      <div className="container main-input">
        <p>Type An Expression Below</p>
        <div>
        <EditableMathField
        latex={latex}
        onChange={(mathField) => {
          setLatex(mathField.latex())
        }}
        />
        </div>
        <div>
        <p>Type the expression's unit below</p>
        <EditableMathField
        latex={unitLatex}
        onChange={(mathField) => {
          setUnitLatex(mathField.latex())
        }}
        />
        </div>
        <button className="main-input-submit" onClick={() => 
          props.makeNewExpression(props.expressions, props.selectedNode, String.raw`${latex}`, String.raw`${unitLatex}`)}>
            Submit
        </button>
      </div>
  );
}

export default MainInput;