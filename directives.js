import angular from "angular";
import * as _ from "lodash";

//this module will need to be imported into your app and registered with angular
const directivesModule = angular.module("Customirectives", [])
  .directive("seSubmit", ["$parse", seSubmit]);


function seSubmit($parse) {
  return {
    restrict: "A",
    require: "form",
    link: function (scope, formElement, attributes, formController) {

      const fn = $parse(attributes.rcSubmit);

      //here we hijack the submit and do the setup for sticky state errors
      formElement.bind("submit", function (event) {
        //this matcherprefix is used in the html pages for setting the ng-message property to evaluate against.        
        const matcherprefix = "sticky";

        //here we get all the model controller object that are apart of the form
        const models = _.filter(formController, (obj) => {
          return typeof obj === "object" && obj.hasOwnProperty("$modelValue");
        });

        //this clears out all the custom matchers we create using our matcherprefix. 
        _.forEach(models, function (cntlValue) {
          //clear old error matchers. This is done so we can ensure if angular cleared a regualr error matcher we get rid of all the sticky ones too so the error messages displayed go away
          _.forEach(cntlValue.$error, function (value, key) {
            if (key.startsWith(matcherprefix)) {
              delete cntlValue.$error[key];
            }
          });

          //set the custom sticky matchers with that appropriate error value
          //In debug mode as part of the $error object you would see sticky-required and required
          //sticky-required: is the one we create to allow for error messages to have sticky state until submit of something else happened again.
          //require: is the standard angular object that will dynamically change base on model state.
          _.forEach(cntlValue.$error, function (value, key) {
            //if we already have a matcher just update it. this means the model is still invalid even after a change was made
            if (key.startsWith(matcherprefix)) {
              cntlValue.$error[key] = value;
            }
            else {
              //if we dont have a sticky matcher and the key coming in is a standard angular $error object create a sticky matcher for it.
              if (!cntlValue.$error.hasOwnProperty(matcherprefix + key)) {
                cntlValue.$error[matcherprefix + key] = value;
              }
            }
          });

          //$fieldInvalid is a custom property set be be used when testing for errors. We use this instead of $invalid so we can use sticky state for errors occuring. 
          //This short circuts angualrs dynamic validation state so anything using this variable will stay "on" even if the user types something in the input that makes the state valid
          //This (_.keys(cntlValue.$error).length > 0 is done because angular removes all $error objects if no errors exist. so we want to explictly ensure no errors are there even if $invalid is still true, due to lifecycle issues
          cntlValue.$fieldInvalid = cntlValue.$invalid && (_.keys(cntlValue.$error).length > 0);
        });

        //now lets execute the reqular angular workflow and call the submit funciton
        scope.$apply(function () {
          fn(scope, { $event: event });
          scope.$broadcast("formSubmitted", { formName: formController.$name });
        });
      });
    }
  };
}


export default directivesModule;
