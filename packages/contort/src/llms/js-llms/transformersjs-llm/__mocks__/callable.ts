export class Callable {
  constructor() {
    var closure: any = function (...args: any) { return closure._call(...args) }
    return Object.setPrototypeOf(closure, new.target.prototype)
  }
  _call(...args: any) {
    console.log(this, args);
  }
};
