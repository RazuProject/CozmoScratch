window.callbackReceiveFeaturedProjects = function(projects) {
  PlayNowModal.callbackReceiveFeaturedProjects(projects);
}


/**
 * Play Now Modal
 * Opens a fullscreen modal window for featured projects that makes it easy
 *  for the user to execute the featured program.
 * @author Adam Platti
 * @since 10/8/2017
 */
var PlayNowModal = function(){
  'use strict';

  var modal;
  var featuredProjectUUID;

  /**
   * Initialize Play Now Modal
   * @returns {void}
   */
  function init() {
    modal = document.querySelector('#play-now-modal');
    _registerEvents();

    // if this is not a featured project, exit now
    if (!window.isCozmoFeaturedProject) {
      // user or sample project, so no Play Now modal
      return;
    }

    // COZMO-17225
    // If we came from the play screen, we record that information in this flag now
    if (window.getUrlVar('fromPlayScreen') == 'true') {
      window.didOpenFromPlayScreen = true;
    }

    // Cover the screen with the play now modal, but the contents won't show until the
    // _show function is called.
    document.body.classList.add('show-play-now-modal');

    // set translations
    setText('#btn-play-now-start .button-label', $t('codeLab.playNowModal.startButtonLabel'));
    setText('#btn-play-now-stop .button-label', $t('codeLab.playNowModal.stopButtonLabel'));
    setText('#btn-play-now-see-inside', $t('codeLab.playNowModal.seeInsideButtonLabel'));
    setText('#play-now-modal .instructions-label', $t('codeLab.playNowModal.instructionsLabel'));

    // load featured projects and see if the current project is one of them
    _loadFeaturedProjects();
  }

  /**
   * register event handlers for buttons in the dialog
   * @return {void}
   */
  function _registerEvents() {
    var startButton = modal.querySelector('#btn-play-now-start');
    startButton.removeEventListener('click', _handleStartButtonClick);
    startButton.addEventListener('click', _handleStartButtonClick);

    var stopButton = modal.querySelector('#btn-play-now-stop');
    stopButton.removeEventListener('click', _handleStopButtonClick);
    stopButton.addEventListener('click', _handleStopButtonClick);

    var seeInsideButton = modal.querySelector('#btn-play-now-see-inside');
    seeInsideButton.removeEventListener('click', _handleSeeInsideButtonClick);
    seeInsideButton.addEventListener('click', _handleSeeInsideButtonClick);

    var closeButton = modal.querySelector('#btn-play-now-close');
    closeButton.removeEventListener('click', _handleCloseButtonClick);
    closeButton.addEventListener('click', _handleCloseButtonClick);
  }


  /**
   * Handle a click on the start project button
   * @param {DOMEvent} e - click event object
   * @retruns {void}
   */
  function _handleStartButtonClick(e){
    modal.classList.add('is-playing');

    // click the real play button`
   document.querySelector('#greenflag').click();
  }

  /**
   * Handle click on stop project button
   * @param {DOMEvent} e = click event handler
   * @returns {void}
   */
  function _handleStopButtonClick(e){
    modal.classList.remove('is-playing');

    // click the real stop button`
   document.querySelector('#stop').click();
  }

  /**
   * Handle click on "Close" button or "See Inside"
   * @param {DOMEvent} e = click event handler
   * @returns {void}
   */
  function _handleCloseButtonClick(e){
    // Prevent duplicate clicks
    var closeButton = modal.querySelector('#btn-play-now-close');
    closeButton.removeEventListener('click', _handleCloseButtonClick);

    // COZMO-17225
    // To support updated Play screen, if we got here from the Play screen
    // we return to the Unity space from this back button
    if (window.didOpenFromPlayScreen) {
      window.prepareToExitWorkspace();
      window.closeCodeLab();
      return;
    }

    window.exitWorkspace();
  }

  function _handleSeeInsideButtonClick(e){
    // COZMO-17225
    // If you came here from the updated play screen, but you decide
    // to see inside the project, we assume that you're more interested in code lab at this point
    // and we no longer return you to unity from a back button click immediately
    window.didOpenFromPlayScreen = false;
    Scratch.workspace.playAudio('click');
    _closeModal();
  }

  /**
   * Hide the Play Now Modal
   * @returns {void}
   */
  function _closeModal() {
    document.body.classList.remove('show-play-now-modal');
  }


  /**
   * Fetches the list of featured projects to determine if the current project is featuerd
   * @returns {void}
   */
  function _loadFeaturedProjects() {
    if (!window.isDev()) {
      // fetch featured projects list from Unity
      window.getCozmoFeaturedProjectList('window.callbackReceiveFeaturedProjects');
    } else {
      // for standalone web development in a web browser, fake loading projects via XHR
      getJSON('../featured-projects.json', function(featuredProjects) {

        var projects = JSON.parse(JSON.stringify(featuredProjects));

        window.callbackReceiveFeaturedProjects(JSON.stringify(projects));
      });
    }
  }

  /**
   * Callback function to receive featured project list.
   * @param {String} projectsJSON - JSON data struture of featured projects
   * @returns {void}
   */
  function callbackReceiveFeaturedProjects(projectsJSON) {
    var projects = JSON.parse(projectsJSON);
    for(var i=0; i < projects.length; i++) {
      if (projects[i].ProjectUUID == window.cozmoProjectUUID) {
        _showPlayNowModal(projects[i]);
        return;
      }
    }
    _closeModal();
  }

  /**
   * Fill in fields and show the Play Now modal for a featured project
   * @param {Object} project - data struture with fields about the featured project
   * @returns {void}
   */
  function _showPlayNowModal(project) {
    if (window.isDev()) {
      _devLoadProject(project);
    }
    // set the project active and inactive images
    var imgUrlRoot = './images/ui/play-now-modal/icon_' + project.FeaturedProjectImageName.toLowerCase();
    modal.querySelector('.project-img-idle').setAttribute('src', imgUrlRoot + '_idle.jpg');

    // set the project title and instructions text
    setText('#play-now-app-title', $t(project.ProjectName));
    setSelectorHtml('#play-now-modal .instructions-text', $t(project.FeaturedProjectInstructions));

    // show the modal
    document.getElementById('play-now-modal').getElementsByClassName('bd')[0].classList.add('modal-ready');
    document.body.classList.add('show-play-now-modal');
  }

  return {
    init: init,
    callbackReceiveFeaturedProjects: callbackReceiveFeaturedProjects
  };
  
  function _devLoadProject(project) {
    var file = 'featuredProjects/' + project.ProjectJSONFile + '_' + window.getUrlVar('locale').toLowerCase() + '.json';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file, true );
    
    xhr.onload = function () {
      var p = window.JSON.parse( xhr.responseText );
      project.projectJSON = JSON.parse(p.ProjectJSON);
      project.projectUUID = p.ProjectUUID;
      window.openCozmoProjectJSON(project);
    };
    
    xhr.onerror = function () {
      //process error
    };

    var oldLoad = window.onload;
    window.onload = function (){
      oldLoad();
      xhr.send();
    }; 
  }
}();
