var phazor;
var php;
var token;
var closeBracket;

function parse(text) {
    // Remove Comments
    phazor = text.replace(/\$\*.*?\*\$/g, '');

    // Phazor token
    php = '';
    token = phazor.indexOf('$');
    closeBracket = phazor.indexOf('}');

    while (token != -1 || closeBracket != -1) {

        // Close bracket exists
        if (closeBracket != -1) {
            if (token != -1) {
                if (closeBracket < token) {
                    processBracket();
                }
            } else {
                processBracket();
            }
        }

        // Token exists
        if (token != -1) {
            if (closeBracket != -1) {
                if (token < closeBracket) {
                    processToken();
                }
            } else {
                processToken();
                debug('No close bracket');
            }
        }

        closeBracket = phazor.indexOf('}');
        token = phazor.indexOf('$');
    }
    // Output remaining php
    php += phazor;
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

function processToken() {
    // Output php
    php += phazor.substring(0, token);
    // Cut at token
    phazor = phazor.substr(token + 1);

    // Get the following character
    switch (phazor[0]) {
        // Code block
        case '{':
            debug('${');
            php += '<?php ';
            var closeIndex = containedIndex('{', '}', phazor.substr(1));
            php += phazor.substr(1, closeIndex);
            php += '?>';
            phazor = phazor.substr(closeIndex + 2);
            break;
            // Expression
        case '(':
            debug('$(');
            php += '<?php echo ';
            var closeIndex = containedIndex('(', ')', phazor.substr(1));
            php += phazor.substr(1, closeIndex);
            php += '; ?>';
            phazor = phazor.substr(closeIndex + 2);
            break;
            // Escape entity
        case '$':
            debug('$$');
            php += '$';
            phazor = phazor.substr(1);
            break;
            // Statement or variable
        default:
            var expression = phazor.match(/\w+/, token).toString();
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
}

function processBracket() {
    var matchElse = phazor.substr(closeBracket).match(/^\}\s?else\s?\{/);
    var matchElseIf = phazor.substr(closeBracket).match(/^\}\s?else\sif\s?\(.*\)\s?\{/);
    var matchCatch = phazor.substr(closeBracket).match(/^\}\s?catch\s?\(.*\)\s?\{/);

    // php += phazor.substring(0, closeBracket);
    // phazor = phazor.substr(closeBracket);

    if (matchElse) {
        // Output php
        php += phazor.substring(0, closeBracket) + '<?php ' + matchElse.toString() + ' ?>';
        // Cut at bracket
        phazor = phazor.substr(closeBracket + matchElse.toString().length);
        debug(matchElse.toString());
    } else if (matchElseIf) {
        // Output php
        php += phazor.substring(0, closeBracket) + '<?php ' + matchElseIf.toString() + ' ?>';
        // Cut at bracket
        phazor = phazor.substr(closeBracket + matchElseIf.toString().length);
        debug(matchElseIf.toString());
    } else if (matchCatch) {
        // Output php
        php += phazor.substring(0, closeBracket) + '<?php ' + matchCatch.toString() + ' ?>';
        // Cut at bracket
        phazor = phazor.substr(closeBracket + matchCatch.toString().length);
        debug(matchCatch.toString());
    } else {
        // Output php
        php += phazor.substring(0, closeBracket) + '<?php } ?>';
        // Cut at bracket
        phazor = phazor.substr(closeBracket + 1);
        debug('}');
    }
}

// Enable debug output
function debug(string) {
    // console.log(string);
}

module.exports = parse;