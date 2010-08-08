/**
 * A simple jslint run-script
 *
 * Credits:
 *   Boldly taken from the jQuery jslint checker
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
load('util/test/jslint.js');

function rightly_check(filename, okays) {
  JSLINT(readFile(filename), { evil: true, forin: true });
  
  okays = okays || [];
  
  for (var i=0, problems=0, w; i < JSLINT.errors.length; i++) {
    w = JSLINT.errors[i];

    if (w && okays.indexOf(w.reason) == -1) {
      problems ++;

      print("\n\n"+ w.reason +" Line "+ w.line + " character "+ w.character + "\n");
      print(w.evidence);
      for (var j=0,pointer=''; j < w.character-1; j++) pointer += '_';
      print(pointer+"^");
    }
  }

  if (problems > 0 ) {
    print( "\n" + problems + " Error(s) found." );
  }
};