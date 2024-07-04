/**
 * Confirm Modal Dialog
 * Provides a modal dialog to ask the use confirm/cancel questions with custom text.
 *
 * @author Adam Platti
 * @since 6/1/2017
 */

var ModalType = function(type){
  var _html = {
    confirm : '<div class="modal-confirm modal-center">' +
              '  <div class="modal-inner">' +
              '    <h2 class="hd modal-confirm-title modal-large-font"></h2>' +
              '    <p class="bd modal-confirm-prompt modal-small-font"></p>' +
              '    <div class="ft">' +
              '      <button class="btn-cancel button-pill button-red-pill modal-small-font"></button>' +
              '      <button class="btn-confirm button-pill button-blue-pill modal-small-font"></button>' +
              '    </div>' +
              '  </div>' +
              '</div>',
    prompt :  '<div class="modal-confirm">' +
              '  <form class="modal-inner modal-inner-small"action="javascript:void(0);">' +
              '      <h2 class="hd modal-confirm-title modal-large-font"></h2>' +
              '      <input class="modal-confirm-input modal-small-font" onkeydown="return ModalPrompt.isValidKey(event);" onkeyup="ModalPrompt.sanitizeInput(this);" autofocus autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input>' +
              '      <div class="ft">' +
              '        <button type=button class="btn-cancel button-pill button-red-pill modal-small-font"></button>' +
              '        <button type=submit class="btn-confirm button-pill button-blue-pill modal-small-font"></button>' +
              '      </div>' +
              '  </form>' +
              '</div>',
    alert :   '<div class="modal-confirm modal-center">' +
              '  <div class="modal-inner">' +
              '    <h2 class="hd modal-confirm-title modal-large-font"></h2>' +
              '    <p class="bd modal-confirm-prompt modal-small-font"></p>' +
              '    <div class="ft">' +
              '      <button class="btn-confirm button-pill button-blue-pill modal-small-font"></button>' +
              '    </div>' +
              '  </div>' +
              '</div>',
  };

  var _dialog = null;   // cached reference to modal dialog container element
  var _options = null;  // options the dialog was opened with, including callback function
  var _illegalCharacters = '&<>"'; // characters to explicitly disallow from prompts

  /**
   * Opens the confirmation dialog
   * @param {Object} options - paramters for text labels in the dialog and callback function
   * @param {String} options.title - title to display for dialog
   * @param {String} options.prompt - prompt text the user is asked to confirm
   * @param {String} options.confirmButtonLabel - label text for confirm button
   * @param {String} options.cancelButtonLabel - label text for cancel button
   * @param {boolean} options.reverseButtons - switch which button returns true to callback
   * @param {Function} options.confirmCallback - function called with result of the confirmation
   * @returns {void}
   */
  function open(options) {

    // add the dialog elements to the page if not already done
    if (!_dialog) {
      _dialog = _render(_html[type]);
      document.body.appendChild(_dialog);
      _dialog.addEventListener('click', _handleClick);
    }

    // save the options, so we can call the callback function later
    _options = options;

    // set the text lables for dialog title, prompt, and buttons
    if (!options.reverseButtons){
      _setDefault('.btn-confirm', options.confirmButtonLabel);
      _setDefault('.btn-cancel', options.cancelButtonLabel);
    } else {
      _setDefault('.btn-confirm', options.cancelButtonLabel);
      _setDefault('.btn-cancel', options.confirmButtonLabel);
    }
    _setDefault('.modal-confirm-title', options.title);
    _setDefault('.modal-confirm-prompt', options.prompt || '');

    modal_prompt_input = _dialog.querySelector('.modal-confirm-input');
    if (modal_prompt_input) {
      modal_prompt_input.value = options.prompt || '';
    }

    // hide all dropdowns
    if ('function' === typeof closeBlocklyDropdowns) {
      closeBlocklyDropdowns();
    }
    
    // add a class to the modal container if the subtext prompt is not being displayed
    if (type != 'prompt' && !options.prompt) {
      _dialog.classList.add('without-prompt');
    } else {
      _dialog.classList.remove('without-prompt');
    }

    // show the dialog
    _dialog.style.visibility = 'visible';

    // HACK!!
    // Using a double timeout here to prevent a flash of the dialog taking up the full width
    //  of the screen and then shrinking to the right size on iOS.  This is the only thing I
    //  found which worked.
    var inner = _dialog.querySelector('.modal-inner');
    setTimeout(function(){
      setTimeout(function(){
        inner.style.top = 0;
      });
    },0);

    if (modal_prompt_input) {
      modal_prompt_input.focus();
    }
  }

  function _setDefault(cls, value) {
    obj = _dialog.querySelector(cls);
    if (obj) {
      obj.textContent = value;
    }
  }

  /**
   * Hides the confirm dialog and clears any state
   * @returns {void}
   */
  function _close() {
    input = _dialog.querySelector('.modal-confirm-input');
    if (input) {
      input.value = '';
    }
    _dialog.style.visibility = 'hidden';
    _options = null;
  }


  /**
   * Handles clicks on the confirm dialog
   * @param {Event} browser click event
   * @returns {void}
   */
  function _handleClick(event) {
    var target = event.target;
    var classes = target.classList;

    if (classes.contains('modal-confirm')) {
      window.player.play('click');
      _close();
    } else if (classes.contains('btn-confirm') && !_options.reverseButtons || classes.contains('btn-cancel') && _options.reverseButtons) {
      // @NOTE: let the caller's callback decide if a click sound should be played
      _confirm();
    } else if (classes.contains('btn-confirm') && _options.reverseButtons || classes.contains('btn-cancel') && !_options.reverseButtons) {
      // @NOTE: let the caller's callback decide if a click sound should be played
      _cancel();
    }
  }
  
  function _confirm() {
    if (_options.confirmCallback) {
      switch(type){
        case 'prompt':
          var input = _dialog.querySelector('.modal-confirm-input');
          sanitizeInput(input);
          _options.confirmCallback(input.value);
          break;
        case 'alert':
          _options.confirmCallback();
          break;
        case 'confirm':
          _options.confirmCallback(true);
          break;
        default:
          _options.confirmCallback(true);
          break;
      }
    } else {
      window.player.play('click');
    }
    _close();
  }
  
  function _cancel() {
    if (_options.confirmCallback) {
      switch(type){
        case 'prompt':
          _options.confirmCallback(null);
          break;
        case 'alert':
          _options.confirmCallback();
          break;
        case 'confirm':
          _options.confirmCallback(false);
          break;
        default:
          _options.confirmCallback(false);
          break;
      }
    } else {
      window.player.play('click');
    }
    _close();
  }

  
  /**
   * Renders the HTML for the confirm dialog and retusn the unattached container element
   * @returns {HTMLElement} container element of the modal dialog
   */
  function _render(html) {
    // render the HTML into a template and return the element
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
  }

  var isValidKey = function(e) {
    if (goog.string.contains(_illegalCharacters, e.key)) {
      window.player.play('click');
      return false;
    }
    return true;
  };

  // Android returns the same keycode for every key (brilliant), so this filters input after the fact
  var sanitizeInput = function(input) {
    input.value = input.value.replace(new RegExp('[' + _illegalCharacters + ']', 'g'), '');
  };

  return {
    open : open,
    isValidKey : isValidKey,
    sanitizeInput : sanitizeInput
  };

};

var ModalConfirm = (ModalType)('confirm');
var ModalAlert = (ModalType)('alert');
var ModalPrompt = (ModalType)('prompt');
