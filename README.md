# untis-vplan-frame-reloader

**This code is outdated and just an upload of things I did in the past. So it does not have to work!!!**

Untis HTML export doesn't work well if there are network issues and a page reloads due to outdated (?) technology using a meta refresh in frames instead of something like AJAX.

This is just a hotfix and not a solution to the initial problem. 

## What should I do to install this?

1. Make sure to get an outdated browser like Microsoft Internet Explorer
2. Include JQuery in your initial page (the one you're showing e.g. on your monitor)
3. Include vplan.js in this page after loading JQuery
4. See that the this code tries to reload the frame content
