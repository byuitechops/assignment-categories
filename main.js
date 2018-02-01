/*eslint-env node, es6*/
/* eslint no-console:0 */

/* Module Description */

/* Put dependencies here */

/* Include this line only if you are going to use Canvas API */
const canvas = require('canvas-wrapper');
const asyncLib = require('async');

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
	 * 	makeAssignmentPointsGroups()				  
	 *  
	 **********************************************/
	function makePointsGroups(weekNum, makePointsGroupsCallback) {
		/* Make an Assignment Group for each week's assignments */
		var position = weekNum;
		if (weekNum.length == 1) {
			/* Add 0 to the beginning of weekNum if single digit */
			weekNum = weekNum.replace(/^/, '0');
		}
		console.log(`weekNum: ${weekNum}\nposition: ${position}`);
		canvas.post(`/api/v1/courses/${course.info.canvasOU}/assignment_groups`, {
				'name': `Week ${weekNum}`,
				'position': position, //doesn't work completely
			},
			(postErr, group) => {
				if (postErr) {
					makePointsGroupsCallback(postErr);
					return;
				}
			});

		course.message(`Made Assignment Groups Using A \'Points Grading System\'`);
		makePointsGroupsCallback(null);
	}

	/**********************************************
	 * 	makeWeightsGroups()				  
	 *  
	 **********************************************/
	function makeWeightsGroups($category, makeWeightsGroupCallback) {
		/* Make an assignment group for each category, with each category's associated name and grade weight */
		console.log(($category).find('name').html());

		/* Somehow get each category's name and wieght through cheerio.js */
		/* category>name will give the name of the category and category>scoring>weight will give the category's weight */
		canvas.post(`/api/v1/courses/${course.info.canvasOU}/assignment_groups`, {
				'name': `Put the category name here`,
				'group_weight': `Put a number here for the category/ group weight`,
			},
			(postErr) => {
				if (postErr) {
					makeWeightsGroupCallback(postErr);
					return;
				}
			});
		course.message(`Made Assignment Groups Using A \'Weights Grading  System\'`);
	}

	/**********************************************
	 * 	chooseGradingSystem()				  
	 *  Parameters: chooseGradingSystemCallback()
	 **********************************************/
	function chooseGradingSystem() {
		/* Get the contents of 'grades_d2l.xml' */
		var myFile = course.content.find(file => {
			return file.name === 'grades_d2l.xml';
		});
		/* If grades_d2l.xml wasn't found, stop the Child Module */
		if (!myFile) {
			course.error(`Couldn't locate \'grades_d2l.xml\' for this course.`);
			stepCallback(null, course);
		}

		var $ = myFile.dom(`configuration>grading_system`);

		/* Check which grading system is used */
		if ($.html() == 0) {
			/* Create an array of the week numbers to iterate through */
			var weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

			/* Make an assignment group for each weeks' assignments */
			asyncLib.each(weeks, makePointsGroups,
				(eachErr) => {
					if (eachErr) {
						course.error(eachErr);
						return;
					}
					course.message(`Successfully completed assignment-categories`);
					stepCallback(null, course);
				});

		} else if ($.html() == 1) {
			console.log(`Grading System: Weights`);
			/* Put the grade weight categories in an array to traverse through */
			var $categories = myFile.dom(`category`);
			/* For each category, create an assignment group */
			asyncLib.each($categories, makeWeightsGroups,
				(eachErr) => {
					if (eachErr) {
						course.error(eachErr);
						return;
					}
					course.message(`Successfully completed assignment-categories`);
					stepCallback(null, course);
				});

		} else if ($.html() == 2) {
			/* This type of grading system is either used so rarely that we won't account for it, or it just shouldn't be used */
			course.warning(`The Grading System is based on a custom Formula. To use this Child Module on this course, please switch grading to be based on Points or Weights under \'My Grades > Grades > Setup Wizard > Start\' in D2L`);
			stepCallback(null, course);

		} else {
			course.error(`Didn't catch a Grading System`);
			stepCallback(null, course);
		}
		/* Put a stepCallback here?? */

	}
	/**********************************************
	 * 				START HERE					  *
	 **********************************************/
	/* Start the child module by choosing which grading system is used */
	chooseGradingSystem();
	//	asyncLib.eachSeries(weeks, chooseGradingSystem,
	//		(eachErr) => {
	//			if (eachErr) {
	//				course.error(eachErr);
	//				return;
	//			}
	//			course.message(`Successfully completed assignment-categories`);
	//			stepCallback(null, course);
	//		});

	/* You should never call the stepCallback with an error. We want the
	whole program to run when testing so we can catch all existing errors */
	//	stepCallback(null, course);
};
