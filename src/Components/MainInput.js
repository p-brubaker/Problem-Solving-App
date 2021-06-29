import React, { useState } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';





addStyles();

const MainInput = (props) => {

  const [latex, setLatex] = useState('')



  return (
      <div className="container main-input">
        <p>Type An Expression Below</p>
        <EditableMathField
        latex={latex}
        onChange={(mathField) => {
          setLatex(mathField.latex())
        }}
        />
        <button className="main-input-submit" onClick={() => 
          props.makeNewExpression(props.expressions, props.selectedNode, String.raw`${latex}`)}>
            Submit
        </button>
      </div>
  );
}

export default MainInput;