function add1(a) {
  // 10
  return function (b) {
    // undefined
    if (b == undefined) {
      return a;
    } else {
      return add1(a + b); // add1(3) => add(6) => add(10)
    }
  };
}

console.log(add1(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)());
