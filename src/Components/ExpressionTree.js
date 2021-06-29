import React from 'react';
import MainInput from './MainInput';
import UnresolvedExpression from './UnresolvedExpression';

function getUnresolved(tree, unResolved = []) {
  tree.forEach(item => {
    if (!item.nodeType) {
      getUnresolved(item, unResolved);
    } else if (item.nodeType === 'expression') {
        if (item.children.length === 0) {
          unResolved.push(item)
        } else {
          getUnresolved(item.children, unResolved);
        }
      } else if (item.nodeType === 'function') {
        getUnresolved(item.children, unResolved)
      }
  })
  return unResolved;
} 

function getExpressions(tree, expressions = []) {
  tree.forEach(item => {
    if (!item.nodeType) {
      getExpressions(item, expressions);
    } else if (item.nodeType === 'expression') {
        if (item.children.length === 0) {
          expressions.push(item); 
        } else {
          expressions.push(item)
          getExpressions(item.children, expressions);
        }
      } else if (item.nodeType === 'function') {
        getExpressions(item.children, expressions);
      }
  })
  return expressions;
}

const ExpressionTree = (props) => {
  return (
      <div>
        The following expressions need resolving:
        { getUnresolved(props.expressions).map((expression, index) =>
          <UnresolvedExpression 
            node={expression} 
            key={index} 
            makeNewExpression={props.makeNewExpression} 
            expressions={props.expressions}
            handleSelectNode={props.handleSelectNode}
          />
        )}
        {props.selectedNode?
        <MainInput 
        makeNewExpression={props.makeNewExpression}
        selectedNode={props.selectedNode}
        expressions={props.expressions}
        />
        : <></>
        }
        {getExpressions(props.expressions).map( expression =>
            <div>
              {expression.latexValue}
            </div>
        )}
        <button onClick={ () => props.handleEvaluateTree(props.expressions)}>Evaluate</button>
        <div>Result: {props.result}</div>
      </div>
  )
}


export default ExpressionTree;
