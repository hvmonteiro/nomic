'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */
//
// Copyright (c) 2017 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// Electron module
const electron = require('electron');

// Module to control application life and create native browser window.
const {app, BrowserWindow} = electron;

// Module to display a dialog box
const dialog = require('electron').dialog;

const path = require('path');

// Validate Address URLs
const validUrl = require('valid-url');


// Module to create window main menu
const Menu = electron.Menu;


const appName = 'nomic';
const appVersion = '0.1';
const homePageURL = 'file://' + path.join(__dirname, '/usage.txt');

const browserOptions = {};

var titleName = appName + ' ' + appVersion;
var debug = false;
var openPageURL = homePageURL;
var configFileName = '';
var menuConfigFileName = '';
var cacheContent = true;

var browserWindowOptions = {
  // width: 380,
  // height: 380,
  // minWidth: 380,
  // minHeight: 380,
  // maxWidth: 380,
  // maxHeight: 380,
  title: titleName,
  // autoHideMenuBar: true,
  ////  maximizable: false,
  // skipTaskbar: false,
  // resizable: true,
  show: false,
  // icon: path.join(__dirname, 'images', 'icon@2.png')
};

// Module to parse command line arguments
var opts = require('commander');

var myArgs = process.argv.slice(2);

opts
  .version('0.0.1')
  .option('-t, --title <title>', 'Sets window title name', titleName)
  .option('-c , --config <file>', 'Configuration file in JSON format with options', path.resolve(process.cwd()) + '/nomic.json')
  .option('--custom-menu <file>', 'Configuration file in JSON format to have customized menus instead of the default.', path.resolve(process.cwd()) + '/menu.json')
  .option('--icon-file <file>', 'Icon file to use as Window icon. ICO, PNG and JPEG are supported.', path.resolve(process.cwd()) + '/nomic.png')
  .option('--kiosk', 'Launches in a kiosk mode, that is, turns the main window into a frontend for a legacy Web Application.', false)
  .option('-f, --fullscreen', 'Launches in fullscreen mode', false)
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
  .option('--test', 'Parse configurations, parameters and test if application execution is Ok.')
  .option('--dev', 'Enable development tools')
  .option('-d, --debug', 'Print debugging info')
  .parse(process.argv);

if (typeof myArgs != null) {
    console.log(myArgs);
//  opts.parse(myArgs[0]);
    console.log('Process argv: %j', process.argv);
    // opts.parse(myArgs[0]));
} 
    process.exit(1);

if (opts.title) browserWindowOptions.title = opts.title;
if (opts.config) configFileName = opts.config;
if (opts.customMenu) menuConfigFileName = opts.customMenu;
if (opts.iconFile) browserWindowOptions.icon = opts.iconFile;
if (opts.kiosk) browserWindowOptions.kiosk = true;
if (opts.fullscreen) browserWindowOptions.fullscreen = true;
if (opts.maximized) browserWindowOptions.maximized = true;
if (opts.width) browserWindowOptions.width = opts.width;
if (opts.height) browserWindowOptions.width = opts.height;
if (opts.minwidth) browserWindowOptions.minwidth = opts.minwidth;
if (opts.minheight) browserWindowOptions.minwidth = opts.maxheight;
if (opts.maxwidth) browserWindowOptions.maxwidth = opts.maxwidth;
if (opts.maxheight) browserWindowOptions.maxwidth = opts.maxheight;
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
if (opts.dev) BrowserWindow.devTools = true;
if (myArgs[0] != null) {
    openPageURL = opts.args[0]; // Set the URL to open
}

// Debug Log
//if (opts.debug) {
  console.log(opts);
  console.log('Arguments specified: %j', process.argv);
  console.log('OpenPageURL: %j', openPageURL);
  console.log('----------------');
  console.log(require('module').globalPaths);
  console.log(require('electron'));
  console.log('----------------');
  console.log('browserWindowOptions: ');
  console.log(browserWindowOptions);
  console.log('opts.args: %j', opts.args);
  console.log('myArgs: %j', myArgs);
//}

// Validate URL
if (!validUrl.isUri(openPageURL)) {
  console.log('Invalid URL: %s', openPageURL);
  process.exit(1);
}

var mainWindow = null;
var appMenu = null;

var menuName = '';
if (process.platform === 'darwin') {
  menuName = electron.remote.app.getName();
} else {
  menuName = 'Menu';
}
process.name = appName;

var mainMenu = [{
  label: menuName,
  submenu: [{
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, BrowserWindow) {
      if (mainWindow) {
        mainWindow._events.close = null; // Unreference function show that App can close
        app.quit();
      }
    }
  }]
}, {
  label: 'About',
  submenu: [{
    label: 'Usage',
    click: function () {
      mainWindow.loadURL('file://' + path.join(__dirname + '/usage.txt'), browserOptions);
    }
  }, {
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal('https://github.com/hvmonteiro/nomic');
    }
  }, {
    label: 'License',
    click: function () {
      dialog.showMessageBox({
        'type': 'info',
        'title': 'License',
        buttons: ['Close'],
        'message': ' '
      });
    }
  }, {
    label: appName,
    click: function (item, BrowserWindow) {
      let onTopOption = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(false);
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': appName + '\nVersion ' + appVersion + '\nGPL 2.0 License'
      });
      mainWindow.setAlwaysOnTop(onTopOption);
    }
  }]
}];

appMenu = Menu.buildFromTemplate(mainMenu);

app.setName(appName);

function createWindow() {
  // debug
  if (debug) {
    console.log('browserWindowOptions');
    console.log(browserWindowOptions);
    console.log('openPageURL: ' + openPageURL);
  }
  // Create the browser window.
  var mainWindow = new BrowserWindow(browserWindowOptions);

  if (opts.disableMenu) {
    Menu.setApplicationMenu(null);
    mainWindow.setMenu(null);
  } else {
    Menu.setApplicationMenu(appMenu);
    mainWindow.setMenu(appMenu);
  }


  // mainWindow.loadURL('about:config', browserOptions);
  mainWindow.loadURL(openPageURL, browserOptions);

  mainWindow.on('show', function (BrowserWindow) {
  });

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault();
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
