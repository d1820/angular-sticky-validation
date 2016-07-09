import angular from "angular";

class SampleController {
  constructor() { }

  hasError(field) {
    if (this.form) {
      return this.form[field].$fieldInvalid && this.form.$submitted;
    }
    else {
      return false;
    }
  }

  submit() {
    if (this.form.$valid) {
      //do valid stuff
      console.log("valid");
    }
    if (this.form.$invalid) {
      console.log("invalidvalid");
    }
  }
}

export default SampleController;
