function float2shifts(f, depth) {
  var base = f | 0;
  var math = '';
  if (base != 0) math += (base + ' ')

  var fraction = f - base; // now we have a fraction
  for (var i = 1; i <= depth; i++) {
    // check that 1/2 is not bigger than the fraction
    console.log(fraction, i)
    if (fraction > 1 / Math.pow(2, i)) {
      math += ' + ( 1 >> ' + i + ')'
    }
  }
  return math
}

if (!module.parent) {
  var num = .299
  var math = float2shifts(num, 10)
  var near = eval(math)
  console.log(num, near, num - near, math)
  console.log()

  num = .587
  math = float2shifts(num, 3)
  near = eval(math)
  console.log(num, near, num - near, math)
}
