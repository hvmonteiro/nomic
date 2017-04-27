#!/usr/bin/env node

/**
 * Module dependencies.
 */


var opts = require('commander');
const validUrl = require('valid-url');

opts
    .version('0.0.1')
    .option('-t, --title <title>', 'Sets window title')
    .option('-c , --config <file>', 'Configuration file in JSON format with options')
    .option('--custom-menu <file>', 'Configuration file in JSON format to have customized menus instead of the default.')
    .option('--icon-file <file>', 'Icon file to use as Window icon')
    .option('--kiosk', 'Launches in a kiosk mode, that is, turns the main window into a frontend for a legacy Web Application.', true)
    .option('-f, --fullscreen', 'Launches in fullscreen mode', true)
    .option('--maximized', 'Launches in a maximized window', true)
    .option('--width <n>', 'Sets the window Width at launch', parseInt)
    .option('--height <n>', 'Sets the window Height at launch', parseInt)
    .option('--minwidth <n>', 'Sets the minimum Width the window is allowed to be resized to', parseInt)
    .option('--minheight <n>', 'Sets the minimum Height the window is allowed to be resized to', parseInt)
    .option('--maxwidth <n>', 'Sets the maximum Width the window is allowed to be resized to', parseInt)
    .option('--maxheight <n>', 'Sets the maximum Height the window is allowed to be resized to', parseInt)
    .option('--center', 'Centers the window in the middle of the desktop', true)
    .option('--disableMenu', 'Disables all Menus. (default: always shown)', true)
    .option('--autoHideMenu', 'Sets the Menu to automatically hide when not in use. (default: always shown)', true)
    .option('--minimizable', 'Sets if the window is allowed to be minimized. (default: true)', true)
    .option('--maximizable', 'Sets if the window is allowed to be maximized. (default: true)', true)
    .option('--skipTaskbar', 'When specified, the application window will not appear in desktop task bar.', true)
    .option('--resizable', 'Doesn\'t allow the window to be resizable', true)
    .option('--no-border', 'Makes the window borderless', true)
    .option('--cache', 'Don\'t cache content', false)
    .option('--dev', 'Enable development tools')
    .option('-d, --debug', 'Print debugging info')

    .parse(process.argv);


if (!process.argv.slice(2).length) {
    opts.outputHelp();
    process.exit(254);
}

openURI = opts.args[0];

if (validUrl.isUri(openURI)){
    console.log('URI to open: %s', openURI);
} else {
    console.log('Invalid URI: %s', openURI);
    process.exit(1);
}

if (opts.debug) {
    console.log(opts);
    console.log('Specified arguments: %j', process.argv);
    if (opts.title) console.log('Title: %j', opts.title);
    if (opts.width) console.log('Width: %j', opts.width);
    if (opts.dev) console.log('Devtools: %j', opts.dev); // this.BrowserWindow.toggleDevTools();
    console.log(openURI);
}
process.exit();

