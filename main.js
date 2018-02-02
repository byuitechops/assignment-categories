/*eslint-env node, es6*/
/* eslint no-console:0 */

/* Module Description */

/* Put dependencies here */

/* Include this line only if you are going to use Canvas API */
const canvas = require('canvas-wrapper');

/* View available course object functions */
// https://github.com/byuitechops/d2l-to-canvas-conversion-tool/blob/master/documentation/classFunctions.md

module.exports = (course, stepCallback) => {

	/**********************************************
	 * 	makeWeightsGroups()				  
	 *  
	 **********************************************/
	function useWeightGroups(weights) {
		/* Make an assignment group for each category, with each category's associated name and grade weight */
		var weightTotal = 0;

		/* Add up all the grade weights */
		weights.each((i, weight) => {
			weightTotal += parseFloat(weight.children[0].data);
		});

		/* Make sure the grade weights add up to 100% */
		if (weightTotal !== 100) {
			course.warning(`\'Grade Weights\' do not add up to 100%, but instead add up to ${weightTotal}%`);
		}

		/* Tell Canvas to use the imported group weights to calculate the final grade */
		canvas.put(`/api/v1/courses/${course.info.canvasOU}`, {
				'course': {
					'apply_assignment_group_weights': true,
				}
			},
			(putErr) => {
				if (putErr) {
					course.error(putErr);
				} else {
					course.message(`Finished setting final grade to be based on assignment group weights`);
				}
				/* Finish the child module */
				stepCallback(null, course);
			});
	}

	/**********************************************
	 * 	findGradingSystem()				  
	 *  Parameters: none
	 **********************************************/
	function findGradingSystem() {
		/* Get the contents of 'grades_d2l.xml' */
		var myFile = course.content.find(file => {
			return file.name === 'grades_d2l.xml';
		});

		/* If grades_d2l.xml wasn't found, stop the child module */
		if (!myFile) {
			course.warning(`Couldn't locate \'grades_d2l.xml\' for this course.`);
			stepCallback(null, course);
		}

		/* Use Cheerio.js to parse through myFile to find the grading system (points or weights) */
		var gradingSystem = myFile.dom(`configuration>grading_system`).html();

		/* If the grading system uses grade weights, call makeWeightsGroups() */
		if (gradingSystem == 1) {
			/* Put the grade weight categories in an array to traverse through */
			var weights = myFile.dom(`category>scoring>weight`);
			useWeightGroups(weights);

		} else {
			course.message(`Course does not use a weighted grade book, moving to next child module`);
			/* Since the course doesn't use weighted grades, skip this child module */
			stepCallback(null, course);
		}
	}
	/**********************************************
	 * 				START HERE					  *
	 **********************************************/
	/* Start the child module by finding out which grading system is used */
	findGradingSystem();

};
