
const units = [
        {
            'name': 'meter',
            'base': [['m'], []],
            'symbol': 'm',
            'measure': 'distance',
            'derived': false
        },
        {
            'name': 'second',
            'base': [['s'], []],
            'symbol': 's',
            'measure': 'time',
            'derived': false
        },
        {
            'name': 'kilogram',
            'base': [['k'], []],
            'symbol': 'kg',
            'measure': 'mass',
            'derived': false
        },
        {
            'name': 'ampere',
            'base': ['A', []],
            'symbol': 'A',
            'measure': 'electric current',
            'derived': false
        },
        {
            'name': 'kelvin',
            'base': ['K', []],
            'symbol': 'K',
            'measure': 'thermodynamic temperature',
            'derived': false
        },
        {
            'name': 'mole',
            'base': ['mol', []],
            'symbol': 'mol',
            'measure': 'amount of substance',
            'derived': false
        },
        {
            'name': 'candela',
            'base': ['cd', []],
            'symbol': 'cd',
            'measure': 'luminous intensity',
            'derived': false
        },
        {
            'name': 'hertz',
            'base': [[], ['s']],
            'symbol': 'Hz',
            'measure': 'frequency',
            'derived': false
        },
        {
            'name': 'newton',
            'base': [['m', 'kg'], ['s', 's']],
            'symbol': 'N',
            'measure': 'force',
            'derived': false
        },
        {
            'name': 'pascal',
            'base': [['kg'], ['m', 's', 's']],
            'symbol': 'Pa',
            'measure': 'pressure',
            'derived': false
        },
        {
            'name': 'joule',
            'base': [['m', 'm', 'kg'],['s', 's']],
            'symbol': 'J',
            'measure': ['energy', 'work', 'quantity of heat'],
            'derived': false
        },
        {
            'name': 'watt',
            'base': [['m', 'm', 'kg'], ['s', 's', 's']],
            'symbol': 'W',
            'measure': 'power',
            'derived': false
        },
        {
            'name': 'coulomb',
            'base': [['s', 'A'], []],
            'symbol': 'C',
            'measure': ['electric charge', 'quantity of electricity'],
            'derived': false
        },
        {
            'name': 'volt',
            'base': [['m', 'm', 'kg'], ['']],
            'symbol': 'V',
            'measure': ['electric potential difference', 'electromotive force'],
            'derived': false
        }
]

function validateUnits(unitArr1, unitArr2) {
    return ([...unitArr1[0], ...unitArr1[1]].sort().join === [...unitArr2[0], ...unitArr2[1]].sort().join());
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

function cleanTexString(string) {
    let arr = string.split('');
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
    return arr;
  }

  function isLetter(str) {
    var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z', '']
    return letters.includes(str);
  }

  function subNodes(arr) {
    //Crashes in this function

    let j;

    // Good up to here
    for (let i = 0; i < arr.length; i++) {
      //infinite loop passes through here
      if (isLetter(arr[i])) {
        j = i;
        let expression = ''
        //Found crashing bug on line below: has to do with grouping of boolean operators. solution
        //returns code to non Eslint compliant state, come back to this later
        while (isLetter(arr[j]) ) {
          expression += arr[j];
          j++;
        }
        var un = {'nodeType': 'unit', 'name': expression};
        arr = [...arr.slice(0, j - expression.length), un, ...arr.slice(j, arr.length)];
        } else if (isNumeric(arr[i])) {
        arr = [...arr.slice(0, i), {'nodeType': 'constant', 'value': arr[i]}, ...arr.slice(i+1, arr.length)]
      }
    }
    return(arr);
  }

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

console.log(subNodes(cleanTexString(String.raw`kg\cdot\frac{m^2}{s}`)));