import React from 'react';

function replaceItem(arr, a, b) {
  let newArr = [];
  for (let i=0; i<arr.length; i++) {
    if (arr[i]===a) {
      newArr.push(b)
    } else {
      newArr.push(arr[i])
    }
  }
  return newArr;
}

 const UnresolvedExpression = (props) => {
   return (
    <div className="unresolved-expression-container container">
      <span>{replaceItem((props.node.name).split(''), '#', '').join('')}</span>
      <button onClick={ () => props.handleSelectNode(props.node)}>
      </button>
    </div>
   )
 }




export default UnresolvedExpression;