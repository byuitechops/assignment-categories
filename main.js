/*eslint-env node, es6*/
/* Module Description */
/* When a course is imported from D2L, if its grading system uses 'Weighted' grades, 
then these weights are imported automatically into Canvas. These grade weights, however, 
are not used until a setting is changed that tells Canvas to use the weights to calculate the final grade. 
This child module is meant to address this issue by changing the setting in Canvas to 
use the weights if the grading system from D2L also used weights. This child module will 
also check to see if the grade weights add up to 100%, and will throw an error if they do not. */

const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
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
			course.warning('Couldn\'t locate \'grades_d2l.xml\' for this course.');
			stepCallback(null, course);
		}

		/* Use Cheerio.js to parse through myFile to find the grading system (points (0), weights (1), or based on a custom formula(2)) */
		var gradingSystem = myFile.dom('configuration>grading_system').html();

		var name = '';
		if (gradingSystem == 0) {
			name = 'points';
		} else if (gradingSystem == 1) {
			name = 'weights';
		} else if (gradingSystem == 2) {
			name = 'custom defined formula - points are still used';
		}

		/* Log the grading system */
		course.log(`Grading System Used`, {
			'grading_system_id': gradingSystem,
			'grading_system_name': name,
		});

		/* If the grading system uses grade weights, call useWeightedGroups() */
		if (gradingSystem == 1) {
			/* Put the grade weight categories in an array to traverse through */
			var weights = myFile.dom('category>scoring>weight');
			useWeightedGroups(weights);

		} else {
			course.message('Course does not use a weighted grade book, moving to next child module');
			/* Since the course doesn't use weighted grades, skip this child module */
			stepCallback(null, course);
		}
	}



	/**********************************************
	 * 	makeWeightedGroups()				  
	 *  Parameters: weights
	 **********************************************/
	function useWeightedGroups(weights) {
		/* Add up all the grade weights and ensure they equal 100% */
		var weightTotal = 0;

		/* Add up all the grade weights */
		weights.each((i, weight) => {
			weightTotal += parseFloat(weight.children[0].data);
		});

		/* If the weights don't add up to 100%, throw a warning and move on */
		if (weightTotal !== 100) {
			course.warning(`Grade Weights do not add up to 100%, but instead add up to ${weightTotal}%`);
		}


		/* Canvas will automatically import the grade weights, but won't use them. 
		This PUT request will tell Canvas to use the weights to calculate the final grade */
		canvas.put(`/api/v1/courses/${course.info.canvasOU}`, {
				'course': {
					'apply_assignment_group_weights': true,
				}
			},
			(putErr) => {
				if (putErr) {
					course.error(putErr);
				} else {
					course.message('Finished setting final grade to be based on assignment group weights');
				}
				/* Finish the child module */
				stepCallback(null, course);
			});
	}

	/**********************************************
	 * 				START HERE					  *
	 **********************************************/
	/* Start the child module by finding out which grading system is used */
	findGradingSystem();

};
