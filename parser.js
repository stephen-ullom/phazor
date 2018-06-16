function parse(text) {
    var phazor = text;

    var options = require('./default.json');

    // Remove Comments
    if(options.comments == false) {
        phazor = text.replace(/\/\*.*?\*\//g, '');
    }

    // Phazor token
    var php = '';
    var token = phazor.match(/\$|\}|\/\*/);

    while (token != null) {
        switch (token.toString()) {
            case '/*':
                // Output previous php
                php += phazor.substr(0, token.index);
                // Cut at token
                phazor = phazor.substring(token.index);

                // Output comment
                var closeComment = phazor.indexOf('*/');
                php += '<?php ' + phazor.substr(0, closeComment + 2) + ' ?>';

                debug(phazor.substr(0, closeComment + 2));
                phazor = phazor.substr(closeComment + 2);
                break;
            case '}':
                // End statement
                var matchElse = phazor.substr(token.index).match(/^\}\s?else\s?\{/);
                var matchElseIf = phazor.substr(token.index).match(/^\}\s?else\sif\s?\(.*\)\s?\{/);
                var matchCatch = phazor.substr(token.index).match(/^\}\s?catch\s?\(.*\)\s?\{/);

                // If additional
                if (matchElse) {
                    // Output php
                    php += phazor.substring(0, token.index) + '<?php ' + matchElse.toString() + ' ?>';
                    // Cut at bracket
                    phazor = phazor.substr(token.index + matchElse.toString().length);
                    debug(matchElse.toString());
                } else if (matchElseIf) {
                    // Output php
                    php += phazor.substring(0, token.index) + '<?php ' + matchElseIf.toString() + ' ?>';
                    // Cut at bracket
                    phazor = phazor.substr(token.index + matchElseIf.toString().length);
                    debug(matchElseIf.toString());
                } else if (matchCatch) {
                    // Output php
                    php += phazor.substring(0, token.index) + '<?php ' + matchCatch.toString() + ' ?>';
                    // Cut at bracket
                    phazor = phazor.substr(token.index + matchCatch.toString().length);
                    debug(matchCatch.toString());
                } else {
                    // Output php
                    php += phazor.substring(0, token.index) + '<?php } ?>';
                    // Cut at bracket
                    phazor = phazor.substr(token.index + 1);
                    debug('}');
                }
                break;
            default:
                // Token must be $

                // Output php
                php += phazor.substring(0, token.index);
                // Cut at token
                phazor = phazor.substr(token.index + 1);

                // Get the following character
                switch (phazor[0]) {
                    // case '*':
                    //     // Comment
                    //     debug('$*');
                    //     php += '<?php ';
                    //     var closeIndex = phazor.indexOf('*$');
                    //     php += phazor.substr(1, closeIndex);
                    //     break;
                    case '{':
                        // Code block
                        debug('${');
                        php += '<?php ';
                        var closeIndex = findClosing('{', '}', phazor.substr(1));

                        php += phazor.substr(1, closeIndex);
                        php += '?>';
                        phazor = phazor.substr(closeIndex + 2);
                        break;
                    case '(':
                        // Expression
                        debug('$(');
                        php += '<?php echo ';
                        var closeIndex = findClosing('(', ')', phazor.substr(1));

                        php += phazor.substr(1, closeIndex);
                        php += '; ?>';
                        phazor = phazor.substr(closeIndex + 2);
                        break;
                    case '$':
                        // Escape entity
                        debug('$$');
                        php += '$';
                        phazor = phazor.substr(1);
                        break;
                    default:
                        // Statement or variable
                        var expression = phazor.match(/\w+/, token.index).toString();
                        // If expression is a statement
                        if (['for', 'foreach', 'function', 'if', 'switch', 'try', 'while'].indexOf(expression) != -1) {
                            // Find first { that is not inside quotes
                            var closePos = phazor.match(/(?:.*?\(.*?\))\s*\{/);

                            var statement = phazor.substr(0, closePos.toString().length);
                            debug('$' + statement);
                            php += '<?php ' + statement + ' ?>';
                            phazor = phazor.substr(statement.length + 1);
                        } else {
                            debug('$' + expression);
                            php += '<?php echo $' + expression + '; ?>';
                            phazor = phazor.substr(expression.length);
                        }
                        break;
                }
                break;
        }
        token = phazor.match(/\$|\}|\/\*/);
    }

    // Output remaining php
    php += phazor;

    // Remove adjacent tags
    if (options.adjacentPHP == false) {
        php = php.replace(/\?>(\s*)<\?php/g, '$1');
    }

    return php;
}

function findClosing(open, close, string) {
    var depth = 0;
    var scanPos = 0;
    // Example regex /\{|\}/
    var regex = new RegExp('\\' + open + '|\\' + close);
    var token = regex.exec(string);

    while (token != null) {
        if (outsideQuotes(token.index, string)) {
            switch (token.toString()) {
                case open:
                    // Debug depth
                    var output = '';
                    for (let index = 0; index <= depth; index++) {
                        output += '-';
                    }
                    debug(output + token);

                    depth++;

                    break;
                case close:
                    if (depth > 0) {

                        depth--;
                    
                        // Debug depth
                        var output = '';
                        for (let index = 0; index <= depth; index++) {
                            output += '-';
                        }
                        debug(output + token);
                    } else {
                        debug(close);
                        return scanPos + token.index;
                    }
                    break;
            }
        } else {
            debug('inside quotes ' + token.toString());
        }
        scanPos += token.index + 1;
        string = string.substr(token.index + 1);
        // Find next token
        token = regex.exec(string);
    }
    console.log('Missing end }');
}

function outsideQuotes(position, string) {
    // Find all quotes
    var reg = /([\"\'])(?:(?=(\\?))\2.)*?\1/g;
    // Default to outside quotes
    var output = true;
    while ((match = reg.exec(string)) != null) {
        if (position > match.index && position < (match.index + match[0].toString().length)) {
            output = false;
        }
    }
    return output;
}

function debug(string) {
    // console.log(string);
}

module.exports = parse;