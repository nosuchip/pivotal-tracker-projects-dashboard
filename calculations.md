# How the graphs are calculated

## Top Line Number (total points in epic). 

Adds all the points for stories that are unstarted, started, finished, delivered, accepted, rejected. This is the total number of points for the epic's graph.

## Bottom Line Number (points done so far) 

Adds up all the points for stories that are unstarted, started, finished, delivered (everything except 'accepted') - this is the point done so far.

## Forecasted Delivery date

Gets all of the iterations and stories in the future.  Looks at the list of stories from bottom line number and finds the last iteration with a story. The forecasted date is the "finish" date of that iteration.
