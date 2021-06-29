import './App.css';
import React, {useState} from 'react';
import ExpressionTree from './Components/ExpressionTree';
import GivenValuesPanel from './Components/GivenValuesPanel';

const mathFuncs = {
  'cos': Math.cos,
  'sin': Math.sin,
  'tan': Math.tan,
  'sqrt': Math.sqrt,
  'ln': Math.log,
  'arctan': Math.atan,
  'acos': Math.acos,
  'arcsin': Math.asin,
  'pow': Math.pow
}


function isNumeric(arg) {
  if (!isNaN(parseFloat(arg)) && isFinite(parseFloat(arg)) ) {
    return true;
  } else {
    return false;
  }
}

function computeValue(functionType, x, ...args) {
  return mathFuncs[functionType](x, args)
}

function isLetter(str) {
  var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z', '']
  return letters.includes(str);
}

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

function cleanTexString(args) {
  let [texString, row, givens] = args;
  let arr = texString.split('');
  arr = replaceItem(arr, '\\', '#');
  while (arr.join('').includes('#frac')
    || arr.join('').includes('#left')
    || arr.join('').includes('#right')
    || arr.join('').includes('#cdot')) {
    var flag = false;
    for (let i = 0; i < arr.length && flag === false ; i++) {
      if (arr.slice(i, i+5).join('') === '#frac') {
        arr = [...arr.slice(0,i),...arr.slice(i+5, arr.length)]
        let token = arr[i];
        while (token !== '}') {
          i++;
          token = arr[i];
        }
        arr = [...arr.slice(0, i + 1),{'name':'/', 'nodeType': 'operator', 'precedence': 2 }, ...arr.slice(i+ 1, arr.length)]
        flag = true;
      } else 
      if (arr.slice(i, i+5).join('') === '#left') {
        arr = [...arr.slice(0,i),...arr.slice(i+5, arr.length)]
        flag = true;
      } else 
      if (arr.slice(i, i+6).join('') === '#right') {
        arr = [...arr.slice(0,i),...arr.slice(i+6, arr.length)]
        flag = true;
      } else
      if (arr.slice(i, i+5).join('') === '#cdot') {
        arr = [...arr.slice(0,i),{'name': '*', 'nodeType': 'operator', 'precedence': 2 },...arr.slice(i+5, arr.length)]
        flag = true;
      }
    }
  }
  arr = replaceItem(arr, '{', { 'name': '(', 'nodeType': 'leftParen' });
  arr = replaceItem(arr, '}', { 'name': ')', 'nodeType': 'rightParen' });
  arr = replaceItem(arr, '(', { 'name': '(', 'nodeType': 'leftParen' });
  arr = replaceItem(arr, ')', { 'name': ')', 'nodeType': 'rightParen' });
  arr = replaceItem(arr, '^', { 'name': '^', 'nodeType': 'operator' })
  arr = replaceItem(arr, '-', { 'name': '-', 'nodeType': 'operator', 'precedence': 1 })
  arr = replaceItem(arr, '+', { 'name': '+', 'nodeType': 'operator', 'precedence': 1 })
  return [arr, row, givens];
}

function subNodes(args) {
  //Crashes in this function
  let [arr, row, givens] = args;
  console.log(arr, row, givens);
  let givensNames = givens.map( given =>  given.description );
  let j;
  let temp;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === ' ') {
      if (arr[i - 1] !== '#') {
        arr = [...arr.slice(0, i ), ...arr.slice(i+1, arr.length)]
      }
    }
  }
  // Good up to here
  for (let i = 0; i < arr.length; i++) {
    console.log(i, arr.length);
    //infinite loop passes through here
    if (arr[i] === '#' && arr[i+1] !== ' ') {
      let substr = '';
      j=i;
      while ( Object.keys(mathFuncs).indexOf(substr) === -1 ) {
        j++;
        substr += arr[j];
      }
      //Either not reached or crashed before here
      var fn = {
          'nodeType': 'function',
          'name': substr,
          'children': []
      };
      arr = [...arr.slice(0, j - substr.length), fn, ...arr.slice(j + 1, arr.length)]
      //Either not reaches or crashes before here
      } else if (isLetter(arr[i])) {
      j = i;
      let expression = ''
      //Found crashing bug on line below: has to do with grouping of boolean operators. solution
      //returns code to non Eslint compliant state, come back to this later
      while (isLetter(arr[j]) || arr[j] === ' ' || arr[j] === '#' && arr[j+1] === ' ' ) {
        if (arr[j] === '#') {
          arr = [...arr.slice(0, j), ...arr.slice(j+1, arr.length)];
        }
        expression += arr[j];
        j++;
      }
      if (givensNames.includes(expression)) {
        var givensMatch = givens[givensNames.indexOf(expression)];
        var gn = {'name': givensMatch.description, 'value': givensMatch.value, 'unit': givensMatch.unit, 'nodeType': 'constant'};
        arr = [...arr.slice(0, j - expression.length), gn, ...arr.slice(j, arr.length)];
      } else {
      var en = {'name': expression, 'nodeType': 'expression', 'children': [], 'isSelected': false };
      en.row = row + 1;
      arr = [...arr.slice(0, j - expression.length), en, ...arr.slice(j, arr.length)];
      }
    } else if (isNumeric(arr[i])) {
      temp = [];
      j = i;
      while (isNumeric(arr[j]) || arr[j] === '.') {
        temp.push(arr[j]);
        j++;
      }
      arr = [...arr.slice(0, j-temp.length), {'nodeType': 'constant', 'value': parseFloat(temp.join(''))}, ...arr.slice(j, arr.length)]
    }
  }
  return(arr);
}

function nestWithPows(arr) {
  var newFunc;
  var kFlag = false;
  var leftSide;
  var rightSide;
  var leftParens;
  var rightParens;
  var j;
  for (let i = arr.length - 1; i >= 0 && kFlag === false; i--) {
    console.log(arr);
    console.log('i: ', i);
      if (arr[i].nodeType === 'function' && arr[i].name !== 'pow') {
        j = i;
        leftParens = 0;
        rightParens = 0;
        while ( leftParens === 0 || leftParens !== rightParens) {
          j++;
          if (arr[j].nodeType === 'leftParen') {
            leftParens++;
          } 
          if (arr[j].nodeType === 'rightParen') {
            rightParens++;
          }
        }
        arr[i].children = arr.slice([i+2], [j]);
        arr = [...arr.slice(0, i), arr[i], ...arr.slice(j+1, arr.length)];
      } else if (arr[i].nodeType === 'operator' && arr[i].name === '^') {
        if (arr[i+1].name === '(') {
          j = i;
          leftParens = 0;
          rightParens = 0;
          while ( leftParens === 0 || leftParens !== rightParens) {
            j++;
            if (arr[j].name === '(') {
              leftParens++;
            } 
            if (arr[j].name === ')') {
              rightParens++;
            }
          }
          rightSide = arr.slice([i+2], [j]);
        } else {
          rightSide = arr[i+1];
          j = i+1;
        }
        if (arr[i-1].name === ')') {
          var k = i;
          leftParens = 0;
          rightParens = 0;
          var flag = false;
          while ( rightParens === 0 || leftParens !== rightParens) {
            k--;
            if (arr[k].name === '(') {
              leftParens++;
            } 
            if (arr[k].name === ')') {
              rightParens++;
            }
            if (( arr[k].nodeType === 'function') || arr[k] === '^') {
                flag = true;
            }
          }
          if (flag === true) {
            leftSide = (nestWithPows(arr.slice(k, i)));
          } else {
          leftSide = arr.slice(k, i)
          }
        } else {
          leftSide = arr[i-1];
          k = i - 1;
        }
        newFunc = {'nodeType': 'function', 'name': 'pow'};
        newFunc.children = [leftSide, rightSide];
        arr = [...arr.slice(0, k), newFunc, ...arr.slice(j+1, arr.length)];
        i = i - ( leftSide.length || 1 + rightSide.length || 1);
        if (k === 0) {
          kFlag = true;
        } 
      }
  }
  return arr;
}

function evaluate(arr) {
  let outputQueue = [];
  let operatorStack = [];
  let token;
  while (arr.length > 0) {
    token = arr.shift();
     if ( token.nodeType === 'expression' || token.nodeType === 'function') {
      if (token.nodeType === 'expression') {
        outputQueue.push(evaluate(token.children));
      } else if (token.nodeType === 'function') {
        if (token.name === 'pow') {
          outputQueue.push(computeValue(token.name, ...token.children.map( child => {
            if (!child.nodeType) {
              return evaluate(child);
            } else {
              return evaluate([child]); 
          }})));
        } else {
          outputQueue.push(computeValue(token.name, evaluate(token.children)));
        }
      }
    } else if ( token.nodeType === 'operator' ) {
      if ( operatorStack.length > 0 && operatorStack[operatorStack.length - 1].name !== '(' ) {
          while ( operatorStack.length > 0 && operatorStack[operatorStack.length - 1].precedence >= token.precedence) {
              outputQueue.push(operatorStack.pop());
          }
      }
      operatorStack.push(token);
    } else if ( token.nodeType === 'constant') {
      outputQueue.push(token.value)
    } else if ( token.nodeType === 'leftParen' ) {
      operatorStack.push(token);
    } else if ( token.nodeType === 'rightParen') {
      while ( operatorStack[operatorStack.length - 1].nodeType !== 'leftParen' ) {
          outputQueue.push(operatorStack.pop());
      } 
      operatorStack.pop();
    } 
  }
  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }
  let evaluatorStack = [];
  let param1;
  let param2;
  let result;

  for ( let i = 0; i < outputQueue.length; i++ ) {
      token = outputQueue[i];
      if ( !isNaN(parseFloat(token)) && isFinite(token) ) {
          evaluatorStack.push(token);
      } else {
          param2 = parseFloat(evaluatorStack.pop());
          param1 = parseFloat(evaluatorStack.pop());
          switch(token.name) {
          case '+':
              result = param1 + param2;
              break;
          case '-': 
              result = param1 - param2;
              break;
          case '/':
              result = param1 / param2;
              break;
          case '*':
              result = param1 * param2;
              break;
          default: return;
          }
          evaluatorStack.push(result);
      }
  }
  console.log(evaluatorStack[0]);
  return evaluatorStack[0];
}

function selectNode(tree, node) {
  let newTree = tree;
  newTree.forEach(item => {
    if (!item.nodeType) {
      selectNode(item, node);
    } else if (item.nodeType === 'expression') {
        if (item.name === node.name) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
          if (item.children.length !== 0) {
            item.children = selectNode(item.children, node);
          }
        }
      } else if (item.nodeType === 'function') {
        item.children = selectNode(item.children, node);
      }
  })
  return newTree;
}

function addChild(tree, node, latex, givens) {
  let newTree = tree;
  newTree.forEach(item => {
    if (!item.nodeType) {
      addChild(item, node, latex, givens);
    } else if (item.nodeType === 'expression') {
        if (item.name === node.name) {
          console.log([latex, item.row, givens]);
          item.children = nestWithPows(subNodes(cleanTexString([latex, item.row, givens])));
          item.latexValue = latex;
          item.isSelected = false;
        } else if (item.children) {
          addChild(item.children, node, latex, givens);
        }
      } else if (item.nodeType === 'function') {
        addChild(item.children, node, latex, givens);
      } 
  })
  return newTree;
}



const App = () => {
  
  let root = {'name': 'root', 'nodeType': 'expression', 'children': [], 'isSelected': 'true' };
  root.row = 0;

  const [appState, setAppState] = useState(
    { expressionTree:  [root] ,
      selectedNode: root,
      givens: null,
      result: null
    }
  )
  
  const handleSelectNode = ( node) => {

    setAppState({
      ...appState,
      expressionTree: selectNode(appState.expressionTree, node),
      selectedNode: node
    })
  }

  const makeNewExpression = (tree, node, latex) => {
  
    setAppState({
      ...appState,
      expressionTree: addChild(tree, node, latex, appState.givens),
      selectedNode: 'undefined'
    })
  }

  const handleSubmitGivens = (givensArr) => {

    setAppState({
      ...appState,
      givens: givensArr
    })
  }

  const handleEvaluateTree = (tree) => {

      setAppState({
        ...appState,
        result: evaluate(tree[0].children)
      })
  }


  return (
    
    <div className="container app-container">
      {!appState.givens?
      <GivenValuesPanel 
        handleSubmitGivens={handleSubmitGivens}
      />

      : appState.givens?
      <ExpressionTree
          expressions={appState.expressionTree}
          makeNewExpression={makeNewExpression}
          handleSelectNode={handleSelectNode}
          selectedNode={appState.selectedNode}
          handleEvaluateTree={handleEvaluateTree}
          result={appState.result}
      />
      :<></>
    }

    </div>
  );
}

export default App;
