// Created by ann0see, 2019
// needs jQuery; Please load it before this in the main untis html frame (subst_001.htm)
// functions

'use strict'
const VPLAN_DEBUG = false; // enable debug mode
const FRAME_CHECK_INTERVAL = 4000; // how often the frames should be checktd
const WAIT_TIME_FACTOR = 1000; // how many ms to multiply on wait
const RESET_FAILED_COUNT_MS = 900000; // how often the reload count should be resetted to 0; this is a quick and dirty fix. If you have better ideas, feel free to fix it
// error box
function addErrorBoxToLogoFrame() { // adds the html to the logo frame to show errors
  var logoFrame = $("frame[name=title]");
  logoFrame.on("load", function() {
    logoFrame.ready(function() {
      var logoFrameDocument = logoFrame[0].contentDocument;
      // add the html to the logoFrame after body
      var errorBox = logoFrameDocument.createElement("div");
      // css
      errorBox.id = "vPlanErrorBox";
      $(errorBox).css({
        'position': 'absolute',
        'top': '12px',
        'opacity': '0.7',
        'font-size': '30px',
        'background-color': 'red',
        'padding': '6px',
        'color': 'white',
        'border-radius': '3px',
        'box-shadow': '2px 2px 6px #000000',
        'display': 'none',
      });
      errorBox.innerHTML = "vplan.js geladen";
      logoFrameDocument.body.prepend(errorBox);
    });
  });
}

function addTextToErrorLogoFrame(errorBoxInnerHTML) { // adds text to the error box in the logo frame
  var logoFrame = $("frame[name=title]");
  logoFrame.ready(function() {
    var logoFrameDocument = logoFrame[0].contentDocument;
    var errorBox = logoFrameDocument.getElementById("vPlanErrorBox");
    // add the html to the logoFrame after body
    // css
    $(errorBox).css({
      'display': 'block',
    });
    errorBox.innerHTML = errorBoxInnerHTML;
  });

}
// main functions

function addFrameSuccess(frame) { // called if the content of the frame is valid
  return true;
}

function addFrameFail(frame) { // called if the content of the frame is invalid
  if (!frame[0].reloadIsBlocked) {// if the reload is not blocked
    if (frame[0].failedReloadCount <= 10) { // try reload for 10 times
      var waitMilliSecs = WAIT_TIME_FACTOR * frame[0].failedReloadCount * frame[0].failedReloadCount;
      console.log("Reloading " + frame[0].name + " after " + waitMilliSecs + "ms");
      frame[0].failedReloadCount++; // increment the reload count
      frame[0].reloadIsBlocked = true; // block the reload
      setTimeout(function() { // reload after some wait time
        reloadFrame(frame);
        frame[0].reloadIsBlocked = false; // unblock the reload
      }, waitMilliSecs);
    } else {
      frame[0].reloadIsBlocked = true;
      //addTextToErrorLogoFrame("Konnte Frame nach mehrmaligen Versuchen in kurzen Zeitabständen nicht neu laden. Bitte Seite neu zu laden.");
      console.error(frame[0].name + ": Frame reloaded 10 times...");
    }
  } else {
    if (VPLAN_DEBUG) {
      console.log(frame[0].name + ': Reloading frame is blocked');
    }
  }
}

function reloadFrame(frame) { // reloads frame if called
  frame.attr('src', frame.attr('src')); // reload
}

function checkFrameContent(frame) { // checks if the content of frame is valid
  // todo check here if we should check or not
  var framePageDocument = frame[0].contentDocument; // get the document of the page
  if (framePageDocument === null) { // check if the inner document is accessable
    return false;
  } else {
    var framePageTitle = framePageDocument.title; // get the title of the page since document is accessable
    if (/Untis/i.test(framePageTitle)) { // if we have Untis (case insensitive in the title, everything is good)
      // all ok
      if (VPLAN_DEBUG) {
        console.log(frame[0].name + ": Frame ok");
      }
      return true;
    } else {
      if (VPLAN_DEBUG) {
        console.error(frame[0].name + ": Title not matching; possibly wrong document. reload page?");
      }
      // save on which url the frame failed
      return false;
    }
  }
}

function frameLoadChecker() { // if the frame loads and the response is invalid, this function tries to handle it at once
  var frame = $(this);
  frame.on("load", function() { // if this frame has (re)loaded
    if (VPLAN_DEBUG) {
      console.log("Frame has loaded with name: " + frame[0].name);
    }
    frame.ready(function() { // if the content (dom) of the frame is ready
      if (VPLAN_DEBUG) {
        console.log("Frame is showing up with name: " + frame[0].name);
      }
      if (checkFrameContent(frame)) { // check if the content of the frame is valid
        addFrameSuccess(frame);
      } else {
        addFrameFail(frame);
      }
    });
  });
}

function framePeriodicChecker() { // this function checks the frames if the content is correct every x seconds. We need it in case the webserver didn't respond with a website
  // setTimeout: check the frame every x milli seconds
  var frame = $(this);
  setInterval(function() { // check frame every FRAME_CHECK_INTERVAL milli seconds
    /*
    If the page has loaded but the frames not, we try to reload them
    */
    if (checkFrameContent(frame)) {
      addFrameSuccess(frame);
    } else { // if it failed: reload frame
      addFrameFail(frame);
    }

  }, FRAME_CHECK_INTERVAL);
}

function frameFailedCountResetter() { // resets failedReloadCount every RESET_FAILED_COUNT_MS milliseconds
  var frame = $(this);
  setInterval(function() {
    frame[0].failedReloadCount = 1;
  }, RESET_FAILED_COUNT_MS);
}

function setNetworkFailHandler(frames) { // the main function for setting the checkers if the frames have the correct content
  frames.each(frameLoadChecker); // for each frame: set the checker to check on a new frame load if page is valid
  frames.each(framePeriodicChecker); // for each frame set the checker to check periodically if the content of the frame given is valid
  frames.each(frameFailedCountResetter); // for each frame reset the failed count every x milliseconds
}

// main script
$(document).ready(function(e) {
  // create the error box
  //addErrorBoxToLogoFrame();
  var frames = $("frame"); // get all dom objects which are frames
  setNetworkFailHandler(frames); // set the handler for network errors in the frames
});

