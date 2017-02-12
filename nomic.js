// 'use strict'; // jshint ignore:line

/* globals require: true, __dirname: true, process: true, esversion: 6 */

// Copyright (c) 2017 Hugo V. Monteiro
// // Use of this source code is governed by the GPL-2.0 license that can be
// // found in the LICENSE file.

// Electron module
const electron = require('electron');

// Module to control application life.
//const app = electron.app;
const app = require('app');

// Module to create native browser window.
// const BrowserWindow = electron.BrowserWindow;
const BrowserWindow = require('browser-window');

// Module to display a dialog box
const dialog = require('electron').dialog;

const path = require('path');


// Module to create window main menu
const Menu = electron.Menu;


const appName = 'nomic';
const appVersion = '0.1';
const homePageURL = 'file://' + path.join(__dirname, 'usage.txt');

const browserOptions = {};

var titleName = appName + ' ' + appVersion;
var debug = false;
var openPageURL = homePageURL;
var configFileName = '';

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
var opts = require("nomnom")
  .options({
    title: {
      abbr: 't',
      help: 'Sets window title',
      callback: function (title) {
        titleName = title;
        browserWindowOptions.title = titleName;
      }
    },
    config: {
      abbr: 'c',
      metavar: 'FILE',
      help: 'Configuration file in JSON format with options',
      callback: function (config) {
          configFileName = config;
      }
    },
    'custom-menu': {
      metavar: 'FILE',
      help: 'Configuration file in JSON format to have customized menus instead of the default.',
      callback: function (menuConfig) {
          menuConfigFileName = menuConfig;
      }
    },
    'icon-file': {
      metavar: 'FILE',
      help: 'Icon file to use as Window icon',
      callback: function (icon) {
          browserWindowOptions.icon = icon;
      }
    },
    kiosk: {
      flag: true,
      help: 'Launches in a kiosk mode, that is, turns the main window into a frontend for a legacy Web Application.',
      callback: function () {
          browserWindowOptions.kiosk = true;
      }
    },
    fullscreen: {
      abbr: 'f',
      flag: true,
      help: 'Launches in fullscreen mode',
      callback: function () {
          browserWindowOptions.fullscreen = true;
      }
    },
    maximized: {
      flag: true,
      help: 'Launches in a maximized window',
      callback: function () {
          browserWindowOptions.maximized = true;
      }
    },
    width: {
      help: 'Sets the window Width at launch',
      callback: function(width) {
        if (width != parseInt(width)) {
          return 'Error: Width value must must be an integer number';
        } else {
          browserWindowOptions.width = width;
        }
      }
    },
    height: {
      help: 'Sets the window Height at launch',
      callback: function(height) {
        if (height != parseInt(height)) {
          return 'Error: Height value must must be an integer number';
        } else {
          browserWindowOptions.height = height;
        }
      }
    },
    minwidth: {
      help: 'Sets the minimum Width the window is allowed to be resized to',
      callback: function(minwidth) {
        if (minwidth != parseInt(minwidth)) {
          return 'Error: minWidth value must must be an integer number';
        } else {
          browserWindowOptions.minwidth = minwidth;
        }
      }
    },
    minheight: {
      help: 'Sets the minimum Height the window is allowed to be resized to',
      callback: function(minheight) {
        if (minheight != parseInt(minheight)) {
          return 'Error: minHeight value must must be an integer number';
        } else {
          browserWindowOptions.minheight = minheight;
        }
      }
    },
    maxwidth: {
      help: 'Sets the maximum Width the window is allowed to be resized to',
      callback: function(maxwidth) {
        if (maxwidth != parseInt(maxwidth)) {
          return 'Error: maxWidth value must must be an integer number';
        } else {
          browserWindowOptions.maxwidth = maxwidth;
        }
      }
    },
    maxheight: {
      help: 'Sets the maximum Height the window is allowed to be resized to',
      callback: function(maxheight) {
        if (maxheight != parseInt(maxheight)) {
          return 'Error: maxHeight value must must be an integer number';
        } else {
          browserWindowOptions.maxheight = maxheight;
        }
      }
    },
    'center': {
      flag: true,
      help: 'Centers the window in the middle of the desktop',
      callback: function () {
        browserWindowOptions.center = true;
      }
    },
    'disableMenu': {
      flag: true,
      help: 'Disables all Menus. (default: always shown)',
      callback: function () {
        browserWindowOptions.autoHideMenuBar = true;
      }
    },
    'autoHideMenu': {
      flag: true,
      help: 'Sets the Menu to automatically hide when not in use. (default: always shown)',
      callback: function () {
        browserWindowOptions.autoHideMenuBar = true;
      }
    },
    'minimizable': {
      default: true,
      help: 'Sets if the window is allowed to be minimized. (default: true)',
      callback: function (option) {
        browserWindowOptions.minimizable = option;
      }
    },
    'maximizable': {
      default: true,
      help: 'Sets if the window is allowed to be maximized. (default: true)',
      callback: function (option) {
        browserWindowOptions.maximizable = option;
      }
    },
    'skipTaskbar': {
      flag: true,
      help: 'When specified, the application window will not appear in desktop task bar.',
      callback: function () {
        browserWindowOptions.skipTaskBar = true;
      }
    },
    'resizable': {
      flag: true,
      default: true,
      help: 'Doesn\'t allow the window to be resizable',
      callback: function (option) {
        browserWindowOptions.resizable = option;
      }
    },
    'no-border': {
      flag: true,
      help: 'Makes the window borderless',
      callback: function () {
        browserWindowOptions.frame = false;
      }
    },
    'cache': {
      flag: true,
      default: true,
      help: 'Don\'t cache content',
      callback: function (option) {
        cacheContent = option;
      }
    },
    debug: {
      abbr: 'd',
      flag: true,
      help: 'Print debugging info',
      callback: function () {
          debug = true;
      }
    }
  }).parse();

// Set the URL to open
if (opts[0]) openPageURL = opts[0];

// Debug Log
if (debug) {
  console.log(opts);
  console.log(require('module').globalPaths);
  console.log(require('electron'));
}


var mainWindow = null;
var appMenu = null;

var menuName = '';
if (process.platform === 'darwin') {
  menuName = require('electron').remote.app.getName();
} else {
  menuName = 'Menu';
}

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
Menu.setApplicationMenu(appMenu);

function createWindow () {
  // debug
  if (debug) {
    console.log('browserWindowOptions');
    console.log(browserWindowOptions);
    console.log('openPageURL: ' + openPageURL);
  }
  // Create the browser window.
  mainWindow = new BrowserWindow(browserWindowOptions);

  // mainWindow.loadURL('about:config', browserOptions);
  mainWindow.loadURL(openPageURL, browserOptions);

  mainWindow.on('show', function (BrowserWindow) {
  });

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault();
  });

  //

  function onBeforeUnload (e, BrowserWindow) { // Working: but window is still always closed
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

  mainWindow.show();
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
