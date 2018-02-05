# Assignment Categories
### Package Name: assignment-categories
### Child Type: post import

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions.

## Purpose

When a course is imported from D2L, if its grading system uses 'Weighted' grades, then these weights are imported automatically into Canvas. These grade weights, however, are not used until a setting is changed that tells Canvas to use the weights to calculate the final grade. 

This child module is meant to address this issue by changing the setting in Canvas to use the weights if the grading system from D2L also used weights. This child module will also check to see if the grade weights add up to 100%, and will throw an error if they do not.

## Process

Describe in steps how the module accomplishes its goals.

1. Open the 'grades_d2l.xml' file
2. Check which grading system is used through Cheerio.js
3. If the grading system is based on weights:
	- Check to see if grade weights add up to 100% and throw a warning if not
	- Tell Canvas to apply the weights to the assignment groups with a PUT request
	- Throw an error if the PUT request encounters issues