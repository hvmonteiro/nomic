'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */
//
// Copyright (c) 2018 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.
const APP_NAME = 'Nomic';
const APP_VERSION = '0.0.2';

// Electron module to control application life and create native browser window.
const {app, BrowserWindow, dialog, Menu, shell} = require('electron');

const menuName = (process.platform === 'darwin') ? app.getName() : 'Menu';

const path = require('path');
const validUrl = require('valid-url');

const homePageURL = 'file://' + path.join(__dirname, '/usage.txt');

const programOptionsSchema = {

    title: APP_NAME + ' (' + APP_VERSION + ')',
    url: homePageURL,
    debug: false,
    browserOptions: {
        title: APP_NAME + ' (' + APP_VERSION + ')',
        icon: path.join(__dirname, '/nomic.ico'),
        fullscreen: false,
        kiosk: false,
        maximized: false,
        width: "70%",
        height: "70%",
        minWidth: 400,
        minHeight: 400,
        maxWidth: 0,
        maxHeight: 0,
        center: false,
        disableMenu: false,
        autoHideMenu: false,
        noMinimize: false,
        noMaximize: false,
        skipTaskbar: false,
        onTop: false,
        noResize: false,
        noBorder: false,
        noCache: false,
        test: false,
        develTools: false,
    },
    mainMenu : [{
        label: menuName,
        submenu: [{
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function (item, browserWindow) {
                if (browserWindow) {
                    browserWindow._events.close = null; // Unreference function show that App can close
                    app.quit();
                }
            }
        }]
    }, {
        label: 'About',
        submenu: [{
            label: 'Usage',
            click: function (item, browserWindow) {
                browserWindow.loadURL('file://' + path.join(__dirname, '/usage.txt'), browserOptions);
            }
        }, {
            label: 'Learn More',
            click: function () {
                shell.openExternal('https://github.com/hvmonteiro/nomic');
            }
        }, {
            label: 'License',
            click: function () {
                dialog.showMessageBox({
                    'type': 'info',
                    'title': 'License',
                    buttons: ['Close'],
                    'message': 'GPL 2.0'
                });
            }
        }, {
            label: APP_NAME,
            click: function (item, browserWindow) {
                let onTopOption = browserWindow.isAlwaysOnTop();
                browserWindow.setAlwaysOnTop(false);
                dialog.showMessageBox({
                    'type': 'info',
                    'title': 'About',
                    buttons: ['Close'],
                    'message': APP_NAME + '\nVersion ' + APP_VERSION + '\nGPL 2.0 License'
                });
                browserWindow.setAlwaysOnTop(onTopOption);
            }
        }]
    }],
    contextMenu: [],
    sysContextMenu : [{
          label: 'Show Window',
          type: 'checkbox',
          checked: true,
          click: function (item, browserWindow) {
            if (browserWindow.isVisible()) {
              browserWindow.hide();
              item.checked = false;
            } else {
              browserWindow.show();
              item.checked = true;
            }
          }
        }, {
          label: 'On Top',
          type: 'checkbox',
          checked: true,
          click: function (item, browserWindow) {
            browserWindow.setAlwaysOnTop(item.checked);
            appMenu.items[0].submenu.items[0].checked = item.checked;
          }
        }, {
          type: 'separator'
        }, {
          label: 'Auto-Hide Menu Bar',
          type: 'checkbox',
          checked: false,
          click: function (item, browserWindow) {
            browserWindow.setAutoHideMenuBar(item.checked);
            browserWindow.setMenuBarVisibility(!item.checked);
            appMenu.items[0].submenu.items[5].checked = item.checked;
          }
        }, {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function (item, browserWindow) {
            if (browserWindow) {
              browserWindow._events.close = null; // Unreference function show that App can close
              app.quit();
            }
          }
        }]
};

const programOptions = programOptionsSchema;
const browserOptions = programOptions.browserOptions;

var titleName = programOptions.title;
var debug = programOptions.debug;
var openPageURL = programOptions.url;
var profileFilename = '';
var cacheContent = browserOptions.noCache;

var appMenu = Menu.buildFromTemplate(programOptions.mainMenu);



app.setName(APP_NAME);
// Application User Model ID (AUMID) for notifications on Windows 8/8.1/10 to function
//app.setAppUserModelId(appId);
//var browserWindowOptions = browserOptions.push({show : false });
var browserWindowOptions = browserOptions;

// Module to parse command line arguments
var opts = require('commander');
/*
if (process.defaultApp == true) {
      process.argv.unshift(null)
}
*/

opts.version(APP_VERSION)
    .usage('[options]')
    .option('--url <address>', 'Open specified URL ', homePageURL)
    .option('--title <title>', 'Sets window title name', titleName)
    .option('--profile <file>', 'Profile file with configuration parameters in JSON format', path.resolve(process.cwd()) + '/nomic.json')
    .option('--fullscreen', 'Launches in fullscreen mode', false)
    .option('--kiosk', 'Launches in a kiosk mode, that is, turns the main window into a frontend for a legacy Web Applications.', false)
    .option('--maximized', 'Launches in a maximized window', false)
    .option('--width <n>', 'Sets the window Width at launch', parseInt)
    .option('--height <n>', 'Sets the window Height at launch', parseInt)
    .option('--minwidth <n>', 'Sets the minimum Width the window is allowed to be resized to', parseInt)
    .option('--minheight <n>', 'Sets the minimum Height the window is allowed to be resized to', parseInt)
    .option('--maxwidth <n>', 'Sets the maximum Width the window is allowed to be resized to', parseInt)
    .option('--maxheight <n>', 'Sets the maximum Height the window is allowed to be resized to', parseInt)
    .option('--center', 'Centers the window in the middle of the desktop', false)
    .option('--disable-menu', 'Disables all Menus. (default: always shown)', false)
    .option('--autohide-menu', 'Sets the Menu to automatically hide when not in use. (default: always shown)', false)
    .option('--no-minimize', 'Sets if the window is allowed to be minimized. (default: false)', true)
    .option('--no-maximize', 'Sets if the window is allowed to be maximized. (default: false)', true)
    .option('--skip-taskbar', 'When specified, the application window will not appear in desktop task bar.', false)
    .option('--on-top', 'Sets whether the window should show always on top of other windows.', false)
    .option('--no-resize', 'Doesn\'t allow the window to be resizable', false)
    .option('--no-border', 'Makes the window borderless', false)
    .option('--no-cache', 'Don\'t cache content', false)
    .option('--no-proxy', 'Disables usage of the existing proxy configuration.', false)
    .option('--test', 'Parse configurations, parameters and test if application execution is Ok.')
    .option('--devel-tools', 'Enable development tools')
    .option('-d, --debug', 'Print debugging info');

process.name = programOptions.title;

if (process.argv.length > 2 ) {
    opts.parse([""].concat(process.argv));
}

// Validate URL
if (!validUrl.isUri(opts.url)) {
    console.log('Invalid URL: %s', opts.url);
    process.exit(1);
} else    {
    openPageURL = opts.url;
}

if (opts.title) browserWindowOptions.title = opts.title;
if (opts.profile) profileFilename = opts.config;
if (opts.iconFile) browserWindowOptions.icon = opts.iconFile;
if (opts.kiosk) browserWindowOptions.kiosk = true;
if (opts.fullscreen) browserWindowOptions.fullscreen = true;
if (opts.maximized) browserWindowOptions.maximized = true;
if (opts.width) browserWindowOptions.width = opts.width;
if (opts.height) browserWindowOptions.width = opts.height;
if (opts.minwidth) browserWindowOptions.minWidth = opts.minwidth;
if (opts.minheight) browserWindowOptions.minWidth = opts.maxheight;
if (opts.maxwidth) browserWindowOptions.maxWidth = opts.maxwidth;
if (opts.maxheight) browserWindowOptions.maxWidth = opts.maxheight;
if (opts.center) browserWindowOptions.center = true;
if (opts.disableMenu) browserWindowOptions.disableMenuBar = true;
if (opts.autohideMenu) browserWindowOptions.autoHideMenuBar = true;
if (opts.noMinimize) browserWindowOptions.minimizable = false;
if (opts.noMaximize) browserWindowOptions.maximizable = false;
if (opts.skipTaskbar) browserWindowOptions.skipTaskBar = true;
if (opts.onTop) browserWindowOptions.alwaysOnTop = true;
if (opts.noResize) browserWindowOptions.resizable = false;
if (opts.noBorder) browserWindowOptions.frame = false;
if (opts.noCache) cacheContent = false;
if (opts.devel) browserWindowOptions.devTools = true;
if (opts.debug) programOptions.debug = true;


// Debug Log
if (opts.debug) {
    console.log(opts);
    console.log('----------------');
    console.log(require('module').globalPaths);
    console.log(require('electron'));
    console.log('----------------');
    console.log('Arguments specified: %j', process.argv);
    console.log('OpenPageURL: %j', openPageURL);
    console.log('browserWindowOptions: ');
    console.log(browserWindowOptions);
    console.log('opts.args: %j', opts.args);
    console.log('process.argv: %j', process.argv);
}


var mainWindow = null;
var appMenu = null;


process.name = APP_NAME;

var mainMenu = browserOptions.mainMenu;

//appMenu = Menu.buildFromTemplate(mainMenu);

app.setName(APP_NAME);
// Application User Model ID (AUMID) for notifications on Windows 8/8.1/10 to function
//app.setAppUserModelId(appId);


function createWindow() {
    // debug
    if (opts.debug) {
        console.log('browserOptions: ');
        console.log(browserOptions);
        console.log('programOptions: ');
        console.log(programOptions);
        console.log('openPageURL: ' + openPageURL);
        console.log('mainMenu: ');
        console.log(programOptions.mainMenu);
    }
    // Create the browser window.
    var mainWindow = new BrowserWindow(browserOptions);

    if (opts.noProxy)    {
        mainWindow.webContents.session.setProxy( { pacScript : '' }, function () { return true; });
    }
    if (opts.disableMenu) {
        Menu.setApplicationMenu(null);  // for MacOS
        mainWindow.setMenu(null);       // for Windows and Linux
    } else {
        Menu.setApplicationMenu(appMenu);// for MacOS
        mainWindow.setMenu(appMenu);     // for Windows and Linux
    }

    // mainWindow.loadURL('about:config', browserOptions);
    //mainWindow.loadURL(openPageURL, browserOptions);
    mainWindow.loadURL(openPageURL);

    mainWindow.on('show', function (BrowserWindow) {
    });

    mainWindow.on('page-title-updated', function (e) {
//        e.preventDefault();
    });

    //

    function onBeforeUnload(e, BrowserWindow) { // Working: but window is still always closed
        /*  e.preventDefault();
            e.returnValue = false;
            {

            let onTopOption = appMenu.items[0].submenu.items[0].checked;
            if (mainWindow) mainWindow.setAlwaysOnTop(false);
            let choice = dialog.showMessageBox({
            type: 'question',
            title: 'Confirm',
            message: 'Are you sure you want to quit?',
            buttons: ['Yes', 'No']
            });
            if (mainWindow) mainWindow.setAlwaysOnTop(onTopOption);
            if (choice === 0) {   // Yes
            console.log(choice);
            e.returnValue = true;
            app.quit();
            return choice;
            } else {              // No
            e.preventDefault();
            e.returnValue = false;
            return choice;
            }*/
        mainWindow._events.close = null; // Unreference function show that App can close
        e.returnValue = false;
    }
    // Emitted when the window is going to be closed, but it's still opened.
    mainWindow.on('close', onBeforeUnload);

    // prevent a new window of being created (ex: target='_blank', etc.)
    mainWindow.webContents.on('new-window', function (e, goToURL) {
        e.preventDefault();
        mainWindow.loadURL(goToURL);
    });

    // This is only used to test if the application start without any problem,
    // the application immediatly exits after this if everything is ok
    if (process.argv[2] === '--test') {
        console.log('Application Execution Test: Ok');
        mainWindow._events.close = null; // Unreference function so that App can close
        mainWindow.close();
        app.quit();
    } else {
        mainWindow.show();
    }
} // function createWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
