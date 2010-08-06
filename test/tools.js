/**
 * Various scripts loading tools
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */

// figuring out the current environment
var current_location = document.location.toString();

var in_safe_mode   = current_location.toString().match(/(\?|&)safe/);
var testing_builds = current_location.toString().match(/(\?|&)build/);

var javascripts = document.getElementsByTagName('script');
var root_path   = javascripts[javascripts.length - 1].getAttribute('src').split('util/test/tools')[0];

/**
 * Includes the filename on the page
 *
 * @param String filename (without the '.js' suffix)
 * @return void
 */
function include_js(filename) {
  document.write('<scr'+'ipt type="text/javascript" src="'+root_path + filename+'.js"></scr'+'ipt>');
};

/**
 * Includes a stylesheet file on the page
 *
 * @param String filename (without the '.css' suffix)
 * @return void
 */
function include_css(filename) {
  document.write('<li'+'nk rel="stylesheet" type="text/css" href="'+ root_path + filename +'.css" />');
};

/**
 * Includes a suitable RightJS build on the page
 *
 * @return void
 */
function include_right_js() {
  include_js('util/lib/right' + (in_safe_mode ? '-safe' : ''));
};

/**
 * Builds the page structure with headers and stuff
 *
 * @return void
 */
function initialize_test_page(title) {
  // setting up the charset
  document.write('<me'+'ta http-equiv="content-type" content="text/html;charset=UTF-8" />');
  include_right_js();
  include_js('util/test/testcase');
  include_css('util/test/test-page');
  
  var no_save_location  = current_location.replace(/(\?|&)safe=[^?&]+/, '');
  var no_build_location = current_location.replace(/(\?|&)build=[^?&]+/, '');
  
  var links = '' +
    '<a href="'+ (no_save_location + (in_safe_mode ? '' : 
      (no_save_location.indexOf('?') < 0 ? '?' : '&') + 'safe=1')
    )+ '" class="safe">'+ (in_safe_mode ? 'Normal Mode' : 'Safe Mode') + '</a>' +
    '<a href="'+ (no_build_location + (testing_builds ? '' : 
      (no_build_location.indexOf('?') < 0 ? '?' : '&') + 'build=1')
    )+ '" class="build">'+ (testing_builds ? 'Test Source' : 'Test Builds') + '</a>'
  ;
  
  if (in_safe_mode) document.title += ' / Safe Mode';
  if (testing_builds) document.title += ' / Builds';
  
  document.write('<h1 id="header">'+ document.title + links +'</h1>');
};

/**
 * Loads up the modules
 *
 * @param String module name
 * ....
 * @return void
 */
var module_name = null;
function load_modules() {
  if (testing_builds) {
    for (var i=0; i < arguments.length; i++) {
      include_js('build/right-'+ arguments[i]);
    }
  } else {
    for (var i=0; i < arguments.length; i++) {
      module_name = arguments[i];
      include_js('src/'+ module_name + '/__init__');
    }
  }
};

/**
 * Hooks up the currently loading module file
 *
 * @param String file name
 * .....
 * @return void
 */
function include_module_files() {
  for (var i=0; i < arguments.length; i++) {
    include_js('src/'+ module_name + '/' + arguments[i]);
  }
};

/**
 * Loads up and initializes the tests
 *
 * @param Object test definition
 * @return void
 */
function run_tests(tests) {
  var names = [];
  
  for (var name in tests) {
    names.push(name);
    include_js('test/'+ tests[name] + '_test');
  }
  
  window.onload = function() {
    eval('new TestSuite('+names.join(',')+').run()');
  };
};