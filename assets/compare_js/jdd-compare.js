'use strict'; function getType(value) {
  if ((function () { return value && (value !== this); }).call(value)) { return typeof value; }
  return ({}).toString.call(value).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}
function forEach(array, callback, scope) { for (var idx = 0; idx < array.length; idx++) { callback.call(scope, array[idx], idx, array); } }
var jdd = {
  LEFT: 'left', RIGHT: 'right', EQUALITY: 'eq', TYPE: 'type', MISSING: 'missing', diffs: [], requestCount: 0, findDiffs: function (config1, data1, config2, data2) {
    config1.currentPath.push('/'); config2.currentPath.push('/'); var key; if (data1.length < data2.length) { for (key in data2) { if (data2.hasOwnProperty(key)) { if (!data1.hasOwnProperty(key)) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2, '/' + key), 'The right side of this object has more items than the left side', jdd.MISSING)); } } } }
    for (key in data1) {
      if (data1.hasOwnProperty(key)) {
        config1.currentPath.push(key); if (!data2.hasOwnProperty(key)) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Missing property <code>' + key + '</code> from the object on the right side', jdd.MISSING)); } else { config2.currentPath.push(key); jdd.diffVal(data1[key], config1, data2[key], config2); config2.currentPath.pop(); }
        config1.currentPath.pop();
      }
    }
    config1.currentPath.pop(); config2.currentPath.pop(); for (key in data2) { if (data2.hasOwnProperty(key)) { if (!data1.hasOwnProperty(key)) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2, key), 'Missing property <code>' + key + '</code> from the object on the left side', jdd.MISSING)); } } }
  }, diffVal: function (val1, config1, val2, config2) { if (getType(val1) === 'array') { jdd.diffArray(val1, config1, val2, config2); } else if (getType(val1) === 'object') { if (['array', 'string', 'number', 'boolean', 'null'].indexOf(getType(val2)) > -1) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be objects', jdd.TYPE)); } else { jdd.findDiffs(config1, val1, config2, val2); } } else if (getType(val1) === 'string') { if (getType(val2) !== 'string') { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be strings', jdd.TYPE)); } else if (val1 !== val2) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both sides should be equal strings', jdd.EQUALITY)); } } else if (getType(val1) === 'number') { if (getType(val2) !== 'number') { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be numbers', jdd.TYPE)); } else if (val1 !== val2) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both sides should be equal numbers', jdd.EQUALITY)); } } else if (getType(val1) === 'boolean') { jdd.diffBool(val1, config1, val2, config2); } else if (getType(val1) === 'null' && getType(val2) !== 'null') { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be nulls', jdd.TYPE)); } }, diffArray: function (val1, config1, val2, config2) {
    if (getType(val2) !== 'array') { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be arrays', jdd.TYPE)); return; }
    if (val1.length < val2.length) { for (var i = val1.length; i < val2.length; i++) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2, '[' + i + ']'), 'Missing element <code>' + i + '</code> from the array on the left side', jdd.MISSING)); } }
    val1.forEach(function (arrayVal, index) {
      if (val2.length <= index) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1, '[' + index + ']'), config2, jdd.generatePath(config2), 'Missing element <code>' + index + '</code> from the array on the right side', jdd.MISSING)); } else {
        config1.currentPath.push('/[' + index + ']'); config2.currentPath.push('/[' + index + ']'); if (getType(val2) === 'array') { jdd.diffVal(val1[index], config1, val2[index], config2); }
        config1.currentPath.pop(); config2.currentPath.pop();
      }
    });
  }, diffBool: function (val1, config1, val2, config2) { if (getType(val2) !== 'boolean') { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'Both types should be booleans', jdd.TYPE)); } else if (val1 !== val2) { if (val1) { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'The left side is <code>true</code> and the right side is <code>false</code>', jdd.EQUALITY)); } else { jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1), config2, jdd.generatePath(config2), 'The left side is <code>false</code> and the right side is <code>true</code>', jdd.EQUALITY)); } } }, formatAndDecorate: function (config, data) {
    if (getType(data) === 'array') { jdd.formatAndDecorateArray(config, data); return; }
    jdd.startObject(config); config.currentPath.push('/'); var props = jdd.getSortedProperties(data); props.forEach(function (key) { config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + '"' + jdd.unescapeString(key) + '": '; config.currentPath.push(key); config.paths.push({ path: jdd.generatePath(config), line: config.line }); jdd.formatVal(data[key], config); config.currentPath.pop(); }); jdd.finishObject(config); config.currentPath.pop();
  }, formatAndDecorateArray: function (config, data) { jdd.startArray(config); data.forEach(function (arrayVal, index) { config.out += jdd.newLine(config) + jdd.getTabs(config.indent); config.paths.push({ path: jdd.generatePath(config, '[' + index + ']'), line: config.line }); config.currentPath.push('/[' + index + ']'); jdd.formatVal(arrayVal, config); config.currentPath.pop(); }); jdd.finishArray(config); config.currentPath.pop(); }, startArray: function (config) {
    config.indent++; config.out += '['; if (config.paths.length === 0) { config.paths.push({ path: jdd.generatePath(config), line: config.line }); }
    if (config.indent === 0) { config.indent++; }
  }, finishArray: function (config) {
    if (config.indent === 0) { config.indent--; }
    jdd.removeTrailingComma(config); config.indent--; config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + ']'; if (config.indent !== 0) { config.out += ','; } else { config.out += jdd.newLine(config); }
  }, startObject: function (config) {
    config.indent++; config.out += '{'; if (config.paths.length === 0) { config.paths.push({ path: jdd.generatePath(config), line: config.line }); }
    if (config.indent === 0) { config.indent++; }
  }, finishObject: function (config) {
    if (config.indent === 0) { config.indent--; }
    jdd.removeTrailingComma(config); config.indent--; config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + '}'; if (config.indent !== 0) { config.out += ','; } else { config.out += jdd.newLine(config); }
  }, formatVal: function (val, config) { if (getType(val) === 'array') { config.out += '['; config.indent++; val.forEach(function (arrayVal, index) { config.out += jdd.newLine(config) + jdd.getTabs(config.indent); config.paths.push({ path: jdd.generatePath(config, '[' + index + ']'), line: config.line }); config.currentPath.push('/[' + index + ']'); jdd.formatVal(arrayVal, config); config.currentPath.pop(); }); jdd.removeTrailingComma(config); config.indent--; config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + ']' + ','; } else if (getType(val) === 'object') { jdd.formatAndDecorate(config, val); } else if (getType(val) === 'string') { config.out += '"' + jdd.unescapeString(val) + '",'; } else if (getType(val) === 'number') { config.out += val + ','; } else if (getType(val) === 'boolean') { config.out += val + ','; } else if (getType(val) === 'null') { config.out += 'null,'; } }, unescapeString: function (val) { if (val) { return val.replace('\\', '\\\\').replace('\"', '\\"').replace('\n', '\\n').replace('\b', '\\b').replace('\f', '\\f').replace('\r', '\\r').replace('\t', '\\t'); } else { return val; } }, generatePath: function (config, prop) {
    var s = ''; config.currentPath.forEach(function (path) { s += path; }); if (prop) { s += '/' + prop; }
    if (s.length === 0) { return '/'; } else { return s; }
  }, newLine: function (config) { config.line++; return '\n'; }, getSortedProperties: function (obj) {
    var props = []; for (var prop in obj) { if (obj.hasOwnProperty(prop)) { props.push(prop); } }
    props = props.sort(function (a, b) { return a.localeCompare(b); }); return props;
  }, generateDiff: function (config1, path1, config2, path2, msg, type) {
    if (path1 !== '/' && path1.charAt(path1.length - 1) === '/') { path1 = path1.substring(0, path1.length - 1); }
    if (path2 !== '/' && path2.charAt(path2.length - 1) === '/') { path2 = path2.substring(0, path2.length - 1); }
    var pathObj1 = config1.paths.find(function (path) { return path.path === path1; }); var pathObj2 = config2.paths.find(function (path) { return path.path === path2; }); if (!pathObj1) { throw 'Unable to find line number for (' + msg + '): ' + path1; }
    if (!pathObj2) { throw 'Unable to find line number for (' + msg + '): ' + path2; }
    return { path1: pathObj1, path2: pathObj2, type: type, msg: msg };
  }, getTabs: function (indent) {
    var s = ''; for (var i = 0; i < indent; i++) { s += '    '; }
    return s;
  }, removeTrailingComma: function (config) { if (config.out.charAt(config.out.length - 1) === ',') { config.out = config.out.substring(0, config.out.length - 1); } }, createConfig: function () { return { out: '', indent: -1, currentPath: [], paths: [], line: 1 }; }, formatPRETags: function () { forEach($('pre'), function (pre) { var codeBlock = $('<pre class="codeBlock"></pre>'); var lineNumbers = $('<div class="gutter"></div>'); codeBlock.append(lineNumbers); var codeLines = $('<div></div>'); codeBlock.append(codeLines); var addLine = function (line, index) { var div = $('<div class="codeLine line' + (index + 1) + '"></div>'); lineNumbers.append($('<span class="line-number">' + (index + 1) + '.</span>')); var span = $('<span class="code"></span'); span.text(line); div.append(span); codeLines.append(div); }; var lines = $(pre).text().split('\n'); lines.forEach(addLine); codeBlock.addClass($(pre).attr('class')); codeBlock.attr('id', $(pre).attr('id')); $(pre).replaceWith(codeBlock); }); }, formatTextAreas: function () { forEach($('textarea'), function (textarea) { var codeBlock = $('<div class="codeBlock"></div>'); var lineNumbers = $('<div class="gutter"></div>'); codeBlock.append(lineNumbers); var addLine = function (line, index) { lineNumbers.append($('<span class="line-number">' + (index + 1) + '.</span>')); }; var lines = $(textarea).val().split('\n'); lines.forEach(addLine); $(textarea).replaceWith(codeBlock); codeBlock.append(textarea); }); }, handleDiffClick: function (line, side) {
    var diffs = jdd.diffs.filter(function (diff) { if (side === jdd.LEFT) { return line === diff.path1.line; } else if (side === jdd.RIGHT) { return line === diff.path2.line; } else { return line === diff.path1.line || line === diff.path2.line; } }); $('pre.left span.code').removeClass('selected'); $('pre.right span.code').removeClass('selected'); $('ul.toolbar').text(''); diffs.forEach(function (diff) { $('pre.left div.line' + diff.path1.line + ' span.code').addClass('selected'); $('pre.right div.line' + diff.path2.line + ' span.code').addClass('selected'); }); if (side === jdd.LEFT || side === jdd.RIGHT) { jdd.currentDiff = jdd.diffs.findIndex(function (diff) { return diff.path1.line === line; }); }
    if (jdd.currentDiff === -1) { jdd.currentDiff = jdd.diffs.findIndex(function (diff) { return diff.path2.line === line; }); }
    var buttons = $('<div id="buttons"><div>'); var prev = $('<a href="#" title="Previous difference" id="prevButton">&lt;</a>'); prev.addClass('disabled'); prev.click(function (e) { e.preventDefault(); jdd.highlightPrevDiff(); }); buttons.append(prev); buttons.append('<span id="prevNextLabel"></span>'); var next = $('<a href="#" title="Next difference" id="nextButton">&gt;</a>'); next.click(function (e) { e.preventDefault(); jdd.highlightNextDiff(); }); buttons.append(next); $('ul.toolbar').append(buttons); jdd.updateButtonStyles(); jdd.showDiffDetails(diffs);
  }, highlightPrevDiff: function () { if (jdd.currentDiff > 0) { jdd.currentDiff--; jdd.highlightDiff(jdd.currentDiff); jdd.scrollToDiff(jdd.diffs[jdd.currentDiff]); jdd.updateButtonStyles(); } }, highlightNextDiff: function () { if (jdd.currentDiff < jdd.diffs.length - 1) { jdd.currentDiff++; jdd.highlightDiff(jdd.currentDiff); jdd.scrollToDiff(jdd.diffs[jdd.currentDiff]); jdd.updateButtonStyles(); } }, updateButtonStyles: function () { $('#prevButton').removeClass('disabled'); $('#nextButton').removeClass('disabled'); $('#prevNextLabel').text((jdd.currentDiff + 1) + ' of ' + (jdd.diffs.length)); if (jdd.currentDiff === 1) { $('#prevButton').addClass('disabled'); } else if (jdd.currentDiff === jdd.diffs.length - 1) { $('#nextButton').addClass('disabled'); } }, highlightDiff: function (index) { jdd.handleDiffClick(jdd.diffs[index].path1.line, jdd.BOTH); }, showDiffDetails: function (diffs) { diffs.forEach(function (diff) { var li = $('<li></li>'); li.html(diff.msg); $('ul.toolbar').append(li); li.click(function () { jdd.scrollToDiff(diff); }); }); }, scrollToDiff: function (diff) { $('html, body').animate({ scrollTop: $('pre.left div.line' + diff.path1.line + ' span.code').offset().top }, 0); }, processDiffs: function () {
    var left = []; var right = []; jdd.diffs.forEach(function (diff) {
      $('pre.left div.line' + diff.path1.line + ' span.code').addClass(diff.type).addClass('diff'); if (left.indexOf(diff.path1.line) === -1) { $('pre.left div.line' + diff.path1.line + ' span.code').click(function () { jdd.handleDiffClick(diff.path1.line, jdd.LEFT); }); left.push(diff.path1.line); }
      $('pre.right div.line' + diff.path2.line + ' span.code').addClass(diff.type).addClass('diff'); if (right.indexOf(diff.path2.line) === -1) { $('pre.right div.line' + diff.path2.line + ' span.code').click(function () { jdd.handleDiffClick(diff.path2.line, jdd.RIGHT); }); right.push(diff.path2.line); }
    }); jdd.diffs = jdd.diffs.sort(function (a, b) { return a.path1.line - b.path1.line; });
  }, validateInput: function (json, side) {
    try {
      jsl.parser.parse(json); if (side === jdd.LEFT) { $('#errorLeft').text('').hide(); $('#textarealeft').removeClass('error'); } else { $('#errorRight').text('').hide(); $('#textarearight').removeClass('error'); }
      return true;
    } catch (parseException) {
      if (side === jdd.LEFT) { $('#errorLeft').text(parseException.message).show(); $('#textarealeft').addClass('error'); } else { $('#errorRight').text(parseException.message).show(); $('#textarearight').addClass('error'); }
      return false;
    }
  }, handleFiles: function (files, side) { var reader = new FileReader(); reader.onload = (function () { return function (e) { if (side === jdd.LEFT) { $('#textarealeft').val(e.target.result); } else { $('#textarearight').val(e.target.result); } }; })(files[0]); reader.readAsText(files[0]); }, setupNewDiff: function () { $('div.initContainer').show(); $('div.diffcontainer').hide(); $('div.diffcontainer pre').text(''); $('ul.toolbar').text(''); $('div.advance').show(); $('div.tools').show(); }, generateReport: function () {
    var report = $('#report'); report.text(''); var newDiff = $('<button class="btn btn-outline-primary btn-primary mt-3">Back To Compare</button>'); report.append(newDiff); newDiff.click(function () { jdd.setupNewDiff(); }); if (jdd.diffs.length === 0) { report.append('<span>The two files were semantically  identical.</span>'); return; }
    var typeCount = 0; var eqCount = 0; var missingCount = 0; jdd.diffs.forEach(function (diff) { if (diff.type === jdd.EQUALITY) { eqCount++; } else if (diff.type === jdd.MISSING) { missingCount++; } else if (diff.type === jdd.TYPE) { typeCount++; } }); var title = $('<div class="reportTitle"></div>'); if (jdd.diffs.length === 1) { title.text('Found ' + (jdd.diffs.length) + ' difference'); } else { title.text('Found ' + (jdd.diffs.length) + ' differences'); }
    report.prepend(title); var filterBlock = $('<span class="filterBlock">Show:</span>'); if (missingCount > 0) {
      var missing = $('<label><input id="showMissing" type="checkbox" name="checkbox" value="value" checked="true"></label>'); if (missingCount === 1) { missing.append(missingCount + ' missing property'); } else { missing.append(missingCount + ' missing properties'); }
      missing.children('input').click(function () { if (!$(this).prop('checked')) { $('span.code.diff.missing').addClass('missing_off').removeClass('missing'); } else { $('span.code.diff.missing_off').addClass('missing').removeClass('missing_off'); } }); filterBlock.append(missing);
    }
    if (typeCount > 0) {
      var types = $('<label><input id="showTypes" type="checkbox" name="checkbox" value="value" checked="true"></label>'); if (typeCount === 1) { types.append(typeCount + ' incorrect type'); } else { types.append(typeCount + ' incorrect types'); }
      types.children('input').click(function () { if (!$(this).prop('checked')) { $('span.code.diff.type').addClass('type_off').removeClass('type'); } else { $('span.code.diff.type_off').addClass('type').removeClass('type_off'); } }); filterBlock.append(types);
    }
    if (eqCount > 0) {
      var eq = $('<label><input id="showEq" type="checkbox" name="checkbox" value="value" checked="true"></label>'); if (eqCount === 1) { eq.append(eqCount + ' unequal value'); } else { eq.append(eqCount + ' unequal values'); }
      eq.children('input').click(function () { if (!$(this).prop('checked')) { $('span.code.diff.eq').addClass('eq_off').removeClass('eq'); } else { $('span.code.diff.eq_off').addClass('eq').removeClass('eq_off'); } }); filterBlock.append(eq);
    }
    report.append(filterBlock);
  }, compare: function () {
    if (jdd.requestCount !== 0) { return; }
    $('body').addClass('progress'); $('#compare').prop('disabled', true); var loadUrl = function (id, errId) { if ($('#' + id).val().trim().substring(0, 4).toLowerCase() === 'http') { jdd.requestCount++; $.post('proxy.php', { 'url': $('#' + id).val().trim() }, function (responseObj) { if (responseObj.error) { $('#' + errId).text(responseObj.result).show(); $('#' + id).addClass('error'); $('body').removeClass('progress'); $('#compare').prop('disabled', false); } else { $('#' + id).val(responseObj.content); jdd.requestCount--; jdd.compare(); } }, 'json'); return true; } else { return false; } }; if (loadUrl('textarealeft', 'errorLeft')) { return; }
    if (loadUrl('textarearight', 'errorRight')) { return; }
    var leftValid = jdd.validateInput($('#textarealeft').val(), jdd.LEFT); var rightValid = jdd.validateInput($('#textarearight').val(), jdd.RIGHT); if (!leftValid || !rightValid) { $('body').removeClass('progress'); $('#compare').prop('disabled', false); return; }
    $('div.initContainer').hide(); $('div.diffcontainer').show(); $('div.advance').hide(); $('div.tools').hide(); jdd.diffs = []; var left = JSON.parse($('#textarealeft').val()); var right = JSON.parse($('#textarearight').val()); var config = jdd.createConfig(); jdd.formatAndDecorate(config, left); $('#out').text(config.out); var config2 = jdd.createConfig(); jdd.formatAndDecorate(config2, right); $('#out2').text(config2.out); jdd.formatPRETags(); config.currentPath = []; config2.currentPath = []; jdd.diffVal(left, config, right, config2); jdd.processDiffs(); jdd.generateReport(); if (jdd.diffs.length > 0) { jdd.highlightDiff(0); jdd.currentDiff = 0; jdd.updateButtonStyles(); }
    $('body').removeClass('progress'); $('#compare').prop('disabled', false); var toolbarTop = $('#toolbar').offset().top - 15; $(window).scroll(function () { if (toolbarTop < $(window).scrollTop()) { $('#toolbar').css('position', 'fixed').css('top', '50px'); } else { $('#toolbar').css('position', 'absolute').css('top', ''); } });
  }, loadSampleData: function () { $('#textarealeft').val('{"Alex Morgan":{"array":["Super Mario Bros.\\"eu","Spider-Man"],"string":"some string","int":2,"aboolean":true,"boolean":true,"object":{"foo":"bar","object1":{"new prop1":"new prop value"},"object2":{"new prop1":"new prop value"},"object3":{"new prop1":"new prop value"},"object4":{"new prop1":"new prop value"}}},"Coco Gauff":{"one":"Monte Carlo","two":"The Fencer"},"Jennifer Lawrence":["The Hunger Games","Red Sparrow"],"California":["San Diego","San Jose"],"John Cena":["F9","Blockers"],"Leonardo DiCaprio":null}'); $('#textarearight').val('{"Alex Morgan":{"array":["Super Mario Bros.","Spider-Man"],"string":"some string","int":"2","otherint":4,"aboolean":"true","boolean":false,"object":{"foo":"bar"}},"Coco Gauff":["Monte Carlo","The Fencer"],"Jennifer Lawrence":["Red Sparrow","The Hunger Games","Passengers","Mother!"],"California":["San Diego","San Jose"],"John Ce*a":["F9","Blockers"],"Alphabet":["Google","Nest","Calico"]}'); }, getParameterByName: function (name) { name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'); var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), results = regex.exec(location.search); return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' ')); }
}; jQuery(document).ready(function () {
  $('#compare').click(function () { jdd.compare(); }); if (jdd.getParameterByName('left')) { $('#textarealeft').val(jdd.getParameterByName('left')); }
  if (jdd.getParameterByName('right')) { $('#textarearight').val(jdd.getParameterByName('right')); }
  if (jdd.getParameterByName('left') && jdd.getParameterByName('right')) { jdd.compare(); }
  $('#sample').click(function (e) { e.preventDefault(); jdd.loadSampleData(); }); $(document).keydown(function (event) { if (event.keyCode === 78 || event.keyCode === 39) { jdd.highlightNextDiff(); } else if (event.keyCode === 80 || event.keyCode === 37) { jdd.highlightPrevDiff(); } });
}); if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate) {
      if (this === null) { throw new TypeError('"this" is null or not defined'); }
      var o = Object(this); var len = o.length >>> 0; if (typeof predicate !== 'function') { throw new TypeError('predicate must be a function'); }
      var thisArg = arguments[1]; var k = 0; while (k < len) {
        var kValue = o[k]; if (predicate.call(thisArg, kValue, k, o)) { return kValue; }
        k++;
      }
      return undefined;
    }, configurable: true, writable: true
  });
}
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function (predicate) {
      if (this === null) { throw new TypeError('"this" is null or not defined'); }
      var o = Object(this); var len = o.length >>> 0; if (typeof predicate !== 'function') { throw new TypeError('predicate must be a function'); }
      var thisArg = arguments[1]; var k = 0; while (k < len) {
        var kValue = o[k]; if (predicate.call(thisArg, kValue, k, o)) { return k; }
        k++;
      }
      return -1;
    }, configurable: true, writable: true
  });
}
function eraseTextleft() { document.getElementById("textarealeft").value = ""; }
function eraseTextright() { document.getElementById("textarearight").value = ""; }
function copyTextleft() { document.getElementById("textarealeft").select(); document.execCommand('copy'); }
function copyTextright() { document.getElementById("textarearight").select(); document.execCommand('copy'); }
function Undoleft() { document.execCommand("undo", false, null); }
function Redoleft() { document.execCommand("redo", false, null); }
function Undoright() { document.execCommand("undo", false, null); }
function Redoright() { document.execCommand("redo", false, null); }
function downloadleft(event) {
  try {
    var textToWrite = JSON.stringify(JSON.parse(textarealeft.value), null, '  '); var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' }); var fileNameToSaveAs = "json-beautifier.json"; var downloadLink = document.createElement("a"); downloadLink.download = fileNameToSaveAs; downloadLink.innerHTML = "Download File"; if (window.webkitURL != null) { downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob); } else { downloadLink.href = window.URL.createObjectURL(textFileAsBlob); downloadLink.onclick = destroyClickedElement; downloadLink.style.display = "none"; document.body.appendChild(downloadLink); }
    downloadLink.click();
  }
  catch (err) { $('#errorLeft').text(err.message).show(); $('#textarealeft').addClass('error'); }
}; function downloadright(event) {
  try {
    var textToWrite = JSON.stringify(JSON.parse(textarearight.value), null, '  '); var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' }); var fileNameToSaveAs = "json-beautifier.json"; var downloadLink = document.createElement("a"); downloadLink.download = fileNameToSaveAs; downloadLink.innerHTML = "Download File"; if (window.webkitURL != null) { downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob); } else { downloadLink.href = window.URL.createObjectURL(textFileAsBlob); downloadLink.onclick = destroyClickedElement; downloadLink.style.display = "none"; document.body.appendChild(downloadLink); }
    downloadLink.click();
  }
  catch (err) { $('#errorRight').text(err.message).show(); $('#textarearight').addClass('error'); }
}; function expand(event) {
  try { textarealeft.value = JSON.stringify(JSON.parse(textarealeft.value), null, '  '); }
  catch (err) { $('#errorLeft').text(err.message).show(); $('#textarealeft').addClass('error'); }
}; function collaps(event) {
  try { textarealeft.value = JSON.stringify(JSON.parse(textarealeft.value)); }
  catch (err) { $('#errorLeft').text(err.message).show(); $('#textarealeft').addClass('error'); }
}; function expandall(event) {
  try { textarearight.value = JSON.stringify(JSON.parse(textarearight.value), null, '  '); }
  catch (err) { $('#errorRight').text(err.message).show(); $('#textarearight').addClass('error'); }
}; function collapsall(event) {
  try { textarearight.value = JSON.stringify(JSON.parse(textarearight.value)); }
  catch (err) { $('#errorRight').text(err.message).show(); $('#textarearight').addClass('error'); }
};