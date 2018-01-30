/*eslint-env node, es6*/
/* eslint no-console:0 */

/* Module Description */

/* Put dependencies here */

/* Include this line only if you are going to use Canvas API */
const canvas = require('canvas-wrapper');

/* View available course object functions */
// https://github.com/byuitechops/d2l-to-canvas-conversion-tool/blob/master/documentation/classFunctions.md

module.exports = (course, stepCallback) => {

    /* Used to log successful actions (specific items) */
    // course.log('Category', {'header': data});

    /* How to log a generic message. Use in place of console.log */
    // course.message('message');

    /* How to report a warning */
    // course.warning('warning message...');

    /* How to report an error */
    // course.error(err);

    /**********************************************
     * 	makePointsCategories()				  
     *  
     **********************************************/
    function makePointsCategories() {
        /* Make a subCategory for each week's assignments */
        for (var i = 1; i < 15; i++) {
            course.post(``, {
                
                },
                (postErr, subCategory) => {

                });
        }
    }

    /**********************************************
     * 	makeWeightsCategories()				  
     *  
     **********************************************/
    function makeWeightsCategories() {
        /* Make a subCategory for each weight, but account for multiple categories that have the same weight value */
        
    }

    /**********************************************
     * 				START HERE					  *
     **********************************************/
    /* Get the contents of 'grades_d2l.xml' */
    var myFile = course.content.find(file => {
        return file.name === 'grades_d2l.xml';
    });

    /* If grades_d2l.xml wasn't found, stop the Child Module */
    if (!myFile) {
        course.warning(`Couldn't locate \'grades_d2l.xml\' for this course.`);
        stepCallback(null, course);
    }

    var $ = myFile.dom(`configuration>grading_system`);

    /* Check which grading system is used */
    if ($.html() == 0) {
        console.log(`Grading System: Points`);
        makePointsCategories();
    } else if ($.html() == 1) {
        console.log(`Grading System: Weights`);
        makeWeightsCategories();
    } else if ($.html() == 2) {
        /* This type of grading system is either used so rarely that we won't account for it, or it just shouldn't be used */
        course.warning(`The Grading System is based on a custom Formula. To use this Child Module on this course, please switch grading to be based on Points or Weights under \'My Grades > Grades > Setup Wizard > Start\' in D2L`);

        stepCallback(null, course);
    } else
        course.warning(`Didn't catch a Grading System`);

    /* You should never call the stepCallback with an error. We want the
    whole program to run when testing so we can catch all existing errors */

    stepCallback(null, course);
};
