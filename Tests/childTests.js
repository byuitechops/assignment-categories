/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');
const asyncLib = require('async');

module.exports = (course, callback) => {
    if (course.info.courseCode !== 'CG 2') {
        callback(null, course);
        return;
    }

    tap.test('assignment-categories', (test) => {
        /* Get the contents of 'grades_d2l.xml' */
        var myFile = course.content.find(file => {
            return file.name === 'grades_d2l.xml';
        });

        /* If grades_d2l.xml wasn't found, stop the child module */
        if (!myFile) {
            course.warning('Couldn\'t locate \'grades_d2l.xml\' for this course.');
            stepCallback(null, course);
        }

        /* Use Cheerio.js to parse through myFile to find the grading system (points (0), weights (1), or based on a custom formula(2)) */
        var gradingSystem = myFile.dom('configuration>grading_system').html();

        if (gradingSystem !== 1) {
            test.fail('Grading system should be weights but isn\'t');
        } else {
            test.pass('Grading system is correct');
        }

        var weights = myFile.dom('category>scoring>weight');
        var weightTotal = 0;

		/* Add up all the grade weights */
		weights.each((i, weight) => {
			weightTotal += parseFloat(weight.children[0].data);
        });
        
        if (weightTotal === 50) {
            test.pass('Weight total adds up correctly');
        } else {
            test.fail('Weights should add up to 50% and they don\'t');
        }

        test.end();
    });

    callback(null, course);
};