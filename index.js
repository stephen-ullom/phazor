#!/usr/bin/env node

var path = require('path');

var file = require('./file');
var parser = require('./parser');

var options = require('./default.json');

try {
    var sass = require('node-sass');
} catch (error) {
    // No sass
}
try {
    var typescript = require('typescript');
} catch (error) {
    // No typescript
}

// var beautify = require('js-beautify').html;

var sourceDir = './source/';
var buildDir = './build/';

// Compile source files
if (process.argv[2] && process.argv[3]) {
    sourceDir = process.argv[2];
    buildDir = process.argv[3];
    compile(sourceDir, buildDir);
} else {
    console.log('Please provide a source folder and an output folder.');
}

function compile(source, destination) {
    // Replace source/folder/file.ext with destination/folder/file.ext

    // Remove ending / or \
    source = source.replace(/[\\\/]$/, '');
    destination = destination.replace(/[\\\/]$/, '');

    compileFile(source, destination);
}

// Compile files
function compileFile(source, destination) {
    // Make the folder if it doesn't exist
    file.makeFolder(destination);

    if (file.isFolder(source)) {
        var files = file.list(source);

        for (const key in files) {
            compileFile(source + '/' + files[key], destination);
        }
    } else {
        var destinationFolder = path.dirname(source.replace(/^[\w-]*/, destination)) + '/';
        file.makeFolder(destinationFolder);

        switch (path.extname(source)) {
            case '.ph':
                var page = file.read(source);
                try {
                    php = parser(page);

                    // page = beautify(page, {
                    //     extra_liners: '',
                    //     preserve_newlines: false
                    // });

                    file.write(destinationFolder + path.parse(source).name + '.php', php);
                } catch (error) {
                    var portion = page.substring(0, error.position);
                    var line = portion.split('\n').length - 1;

                    // Pass javascript error
                    console.log(error);

                    showError('Phazor', error.code, source + ':' + line + ':' + error.position);
                }
                break;
            case '.ts':
                if (typescript) {
                    try {
                        var ts = file.read(source);
                        if (ts != '') {
                            var output = typescript.transpileModule(ts, {
                                compilerOptions: {
                                    module: typescript.ModuleKind.CommonJS
                                }
                            });
                            file.write(destinationFolder + path.parse(source).name + '.js', output.outputText);
                        }
                    } catch (error) {
                        showError('TypeScript Error', error.message, source + ':' + error.line);
                    }
                } else {
                    showError('Warning', 'The \'typescript\' package must be installed to compile .ts files.', false);
                }
                break;
            case '.scss':
                if (sass) {
                    try {
                        var scss = file.read(source);
                        // Minify CSS if enabled in options
                        var minify = 'nested';
                        if (options) {
                            if (options.minifyCSS == true) {
                                minify = 'compressed';
                            }
                        }
                        if (scss != '') {
                            var output = sass.renderSync({
                                data: scss,
                                outputStyle: minify
                            });
                            file.write(destinationFolder + path.parse(source).name + '.css', output.css);
                        }
                    } catch (error) {
                        showError('Sass Error', error.message, source + ':' + error.line);
                    }
                } else {
                    showError('Warning', 'The \'node-sass\' package must be installed to compile .scss files.', false);

                }
                break;
            default:
                file.copy(source, destinationFolder + path.basename(source));
                break;
        }
    }
}

function showError(type, message, location) {
    var color = '0';
    switch (type.toLowerCase()) {
        case 'error':
            // Red
            color = '1;31';
            break;
        case 'warning':
            // Yellow
            color = '1;33';
            break;
        case 'typescript error':
            // Blue
            color = '1;34';
            break;
        case 'sass error':
            // Purple
            color = '1;35';
            break;
    }
    if (location) {
        location = '(' + location + ')';
    } else {
        location = '';
    }
    console.log('\x1b[' + color + 'm%s\x1b[0m', type + ':', message, location);
}