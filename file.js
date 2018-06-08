var fs = require('fs');

module.exports = {
    read: function(path) {
        return fs.readFileSync(path, 'utf-8');
    },
    write: function(path, data) {
        fs.writeFileSync(path, data);
        showMessage('Write', path);
    },
    copy: function(path, destination) {
        fs.copyFileSync(path, destination);
        showMessage('Copy', destination);
    },
    isFolder: function(path) {
        return fs.lstatSync(path).isDirectory();
    },
    list: function(path) {
        return fs.readdirSync(path);
    },
    exists: function(path) {
        return fs.existsSync(path);
    },
    makeFolder: function(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            showMessage('Folder', path);
        }
    },
    delete: function(path) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            showMessage('Delete', path);
        }
    }
}

function showMessage(type, message) {
    var color = '0';
    switch (type.toLowerCase()) {
        case 'write':
            // Green
            color = '1;32';
            break;
        case 'copy':
            // Green
            color = '1;32';
            break;
        case 'folder':
            // Yellow
            color = '1;33';
            break;
        case 'delete':
            // Red
            color = '31';
            break;
    }
    console.log('\x1b[' + color + 'm%s\x1b[0m', type, message);
}