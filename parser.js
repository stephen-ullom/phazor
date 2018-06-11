
function parse(text) {
    var phazor = text;
    var php;

    var options = require('./default.json');

    // Remove Comments
    // phazor = text.replace(/\$\*.*?\*\$/g, '');

    // Phazor token
    php = '';
    var token = phazor.match(/\$|\}|\/\*/);

    // console.log(token);
    while (token != null) {
        // debug(token.toString());
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
                var matchElse = phazor.substr(token.index).match(/^\}\s?else\s?\{/);
                var matchElseIf = phazor.substr(token.index).match(/^\}\s?else\sif\s?\(.*\)\s?\{/);
                var matchCatch = phazor.substr(closeBracket).match(/^\}\s?catch\s?\(.*\)\s?\{/);

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
                // Must be $
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
                        var closeIndex = containedIndex('{', '}', phazor.substr(1));
                        php += phazor.substr(1, closeIndex);
                        php += '?>';
                        phazor = phazor.substr(closeIndex + 2);
                        break;
                    case '(':
                        // Expression
                        debug('$(');
                        php += '<?php echo ';
                        var closeIndex = containedIndex('(', ')', phazor.substr(1));
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
                            var statement = phazor.substr(0, phazor.indexOf('{') + 1);
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
    if (options.adjacentTags == false) {
        php = php.replace(/\?>(\s*)<\?php/g, '$1');
    }

    // debug(token);
    return php;
}

function containedIndex(open, close, string) {
    var openPos = string.indexOf(open);
    var closePos = string.indexOf(close);
    var depth = 0;
    // If both tokens exist
    do {
        if (openPos != -1 && closePos != -1) {
            // If open token comes first
            // debug(openPos + ' < ' + closePos);
            if (openPos < closePos) {
                // Debug depth
                var output = '';
                for (let index = 0; index <= depth; index++) {
                    output += '-';
                }
                debug(output + open);

                depth++;
                // Set new positions
                closePos = string.indexOf(close, openPos + 1);
                openPos = string.indexOf(open, openPos + 1);
            } else {
                depth--;
                // Debug depth
                var output = '';
                for (let index = 0; index <= depth; index++) {
                    output += '-';
                }
                debug(output + close);

                // Set new positions
                if (depth > -1) {
                    openPos = string.indexOf(open, closePos + 1);
                    closePos = string.indexOf(close, closePos + 1);
                }
            }
        } else if (closePos != -1) {
            if (depth > 0) {
                // Debug depth
                var output = '';
                for (let index = 0; index < depth; index++) {
                    output += '-';
                }
                debug(output + close);

                depth--;
                closePos = string.indexOf(close, closePos + 1);
            }
        } else {
            depth = 0;
            if (closePos == -1) {
                debug('Missing ' + close);
            }
        }
    } while (depth > 0);

    // closePos = string.indexOf(close, closePos + 1);
    // debug(closePos);
    debug(close);
    return closePos;
}

function debug(string) {
    // console.log(string);
}

module.exports = parse;