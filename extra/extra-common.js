/**
 * Utility function shared by the Tutorial, Challenges, and Save/Load Projects pages
 * @author Adam Platti
 * @since May 4, 2017
 */

window._$translations = window._$translations || {};  // replaced later with translation dictionary

/**
 * Returns localized strings for display.  Accepts optional parameters
 *  to substitue into localized string.
 *
 * Example:  $t("{0} Unicorns", 5)  returns  "5 Unicorns"
 *
 * @param {String} str - localized string with possible substitution flags
 * @param
 */
window.$t = function $t(str) {
  // use a translation if you find one, or echo back the string passed in
  str = window._$translations[str] || str;

  // all strings should come from the translations object's 'translation' property
  if (typeof str == "object" && typeof str.translation !== 'undefined') {
    str = str.translation;
  }

  // subsitute values into the translated string if params are passed
  if (arguments.length > 1) {
    var numSubs = arguments.length - 1;
    for (var i=0; i<numSubs; i++) {
      // substitute the values in the string like "{0}"
      str = str.replace('{'+i+'}', arguments[i+1]);
    }
  }
  return str;
};

/**
 * Sets text inside an element described by a CSS selector
 * @param {String} selector - CSS selector of element to set text for
 * @param {String} text - text to apply to element
 * @returns {void}
 */
window.setText = function setText(selector, text) {
  var elem = document.querySelector(selector);
  if (elem) {
    elem.textContent = text;
  }
};

/**
 * Sets html inside an element described by a CSS selector
 * @param {String} selector - CSS selector of element to set text for
 * @param {String} html - html to apply to element
 * @returns {void}
 */
window.setSelectorHtml = function setSelectorHtml(selector, html) {
  var elem = document.querySelector(selector);
  if (elem) {
    elem.innerHTML = html;
  }
}

/**
 * parses URL get parameters and returns a dictionary of name/values (url decoded)
 * @returns {Object} name => value
 */
window.getUrlVars = function() {
  var vars = {};
  var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
  function(m,key,value) {
    vars[key] = decodeURIComponent(value);
  });
  return vars;
};

window.getUrlVar = function(varName){
  var params = window.getUrlVars();
  return params[varName] || undefined;
}


/**
 * looks for URL parameter to signify page is running in a web browser and not a unity app
 */
window.isDev = function() {
  return window.getUrlVar('isDev') === 'true';
}


/**
 * Fetches JSON and passes it to a callback
 * @param {String} url - url to fetch
 * @param {Function} callback - function called to accept JSON data
 * @returns {void}
 */
window.getJSON = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var data = JSON.parse(this.response);
      callback(data);
    }
  };
  request.send();
};

/**
 * Render template and substitute keys
 * @param {String} template - simple template language
 * @param {Object} map - key/values to substitute into the template
 */
window._populateTemplate = function(template, map) {
  var rendered = template;

  // replace keys in template text surrounded by two curly braces, like {{KeyName}}
  for (var key in map) {
    var regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');

    // if key ends in "Key", assume it's a translation key and look up the translation
    var value = (key.match("Key$")) ? $t(map[key]) : map[key];
    if (typeof value === 'object') {
      // replace value with translation
      value = value.translation;
    }

    // substitute values into the template
    rendered = rendered.replace(regex, value);
  }

  // return the rendered template with the substituted values
  return rendered;
};


/**
 * Returns category color of a puzzle block.  Used for coloring the icon.
 * @param {String} icon - name of the icon
 * @returns {String} category color of the icon
 */
window.getBlockIconColor = function(icon) {
  switch (icon) {

    // motion blocks
    case 'cozmo-backward':
    case 'cozmo-backward-fast':
    case 'cozmo-forward':
    case 'cozmo-forward-fast':
    case 'cozmo-turn-left':
    case 'cozmo-turn-right':
    case 'cozmo-dock-with-cube':
      return 'blue';

    // looks blocks
    case 'cozmo-forklift-high':
    case 'cozmo-forklift-low':
    case 'cozmo-forklift-medium':
    case 'cozmo-head-angle-high':
    case 'cozmo-head-angle-medium':
    case 'cozmo-head-angle-low':
    case 'set-led_black':
    case 'set-led_blue':
    case 'set-led_coral':
    case 'set-led_green':
    case 'set-led_mystery':
    case 'set-led_orange':
    case 'set-led_purple':
    case 'set-led_white':
    case 'set-led_yellow':
    case 'cozmo_says':
      return 'purple';

    // event blocks
    case 'cozmo-face':
    case 'cozmo-face-happy':
    case 'cozmo-face-sad':
    case 'cozmo-cube':
    case 'cozmo-cube-tap':
      return 'yellow';

    // control blocks
    case 'control_forever':
    case 'control_repeat':
      return 'orange';

    // actions blocks
    case 'cozmo-anim-bored':
    case 'cozmo_anim-cat':
    case 'cozmo_anim-chatty':
    case 'cozmo-anim-dejected':
    case 'cozmo-anim-dog':
    case 'cozmo-anim-excited':
    case 'cozmo-anim-frustrated':
    case 'cozmo-anim-happy':
    case 'cozmo-anim-mystery':
    case 'cozmo-anim-sleep':
    case 'cozmo-anim-sneeze':
    case 'cozmo-anim-surprise':
    case 'cozmo-anim-thinking':
    case 'cozmo-anim-unhappy':
    case 'cozmo-anim-victory':
      return 'pink';

    // no default to make mistakes more obvious
  }
}

// Performance display hook for Development (is never called from SHIPPING app builds)
window.setPerformanceData = function(perfStateJSON) {
  if (document.body == null) {
    // Wait for the page to finish loading
    return;
  }
  var perfElement = document.getElementById("perfDisplay");
  if (perfElement == null) {
      // Create the element programmatically
      perfElement = document.createElement("div");
      perfElement.id = "perfDisplay";
      perfElement.style.cssText = 'display:block;position:absolute;bottom:1px;right:70px;background-color:black;z-index:999999;pointer-events:visible;';
      perfElement.onclick = function () {
        var perfElement = document.getElementById("perfDisplay");
        if (perfElement != null) {
          perfElement.style.visibility='hidden';
        }
      };
      // Add it to the HTML page 
      document.body.appendChild(perfElement);
  }

  if (perfElement != null) {
      var perfHTML = "";
      for (x in perfStateJSON) {
        perfHTML += x + ": " + perfStateJSON[x] + "<br>";
      }
      perfElement.innerHTML = "<font color='white' bgcolor='black'>" + perfHTML + "</font>";            
  }
  else {
      console.log("Error: perfElement is still null!");
  }
}
