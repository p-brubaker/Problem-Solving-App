import React, { useState } from 'react';
import { EditableMathField } from 'react-mathquill';
const GivenValuesPanel = (props) => {

    const [latex, setLatex] = useState('');
    const [givens, setGivens] = useState([]);
    const [currentValue, setCurrentValue] = useState('');
    // const [currentUnit, setCurrentUnit] = useState('');
    const [currentDescription, setCurrentDescription] = useState('');

    const handleAddGiven = () => {
        setGivens([...givens, {'nodeType': 'constant', 'value': currentValue, 'unit': String.raw`${latex}`, 'description': currentDescription}]);
        setCurrentValue('');
        // setCurrentUnit('');
        setCurrentDescription('');
        setLatex('');
    }

    const handleChangeDescription = e => setCurrentDescription(e.target.value);
    const handleChangeValue = e => setCurrentValue(e.target.value);
    // const handleChangeUnit = e => setCurrentUnit(e.target.value);

    return (
    
        <div className="given-values-panel">
        <h3>Enter a given value here</h3>
        <input id="givens-input-value" value={currentValue} onChange={handleChangeValue}></input>
        <h3>Enter the associated unit here</h3>
        <EditableMathField
        latex={latex}
        onChange={(mathField) => {
          setLatex(mathField.latex())
        }}
        />
        {/* <input id="givens-unit-input" value={currentUnit} onChange={handleChangeUnit}></input> */}
        <h3>Enter the given value's description here</h3>
        <input id="givens-description-input" value={currentDescription} onChange={handleChangeDescription}></input>
        <button onClick={ handleAddGiven }>Submit</button>
        <button onClick={() => props.handleSubmitGivens(givens)}>Done</button>
        </div>


);}


export default GivenValuesPanel;