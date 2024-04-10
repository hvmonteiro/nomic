'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */
//
// Copyright (c) 2024 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// Debug Log
// console.log(require('module').globalPaths);
// console.log(require('electron'));

// Electron module to control application life and create native browser window.
const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const menuName = (process.platform === 'darwin') ? app.getName() : 'Menu';

const { URL } = require('url');

// Read application info directly from package.json
const packageJson = require(path.join(__dirname, 'package.json'));

// Default application JSON file to store profile settings between sessions
const nomicProfileJson = path.join(__dirname, 'nomic.json');

const homePageURL = `file://${path.join(__dirname, 'usage.txt')}`;

const appName = packageJson.productName;
const appVersion = packageJson.version;
const appBuildId = packageJson.buildId;
const appCopyright = packageJson.copyright;
const appAuthor = packageJson.author;
const appLicense = packageJson.license;
const appWebURL = packageJson.homePage;
const appSupportURL = packageJson.bugs.url;

const programOptionsSchema = {

    title: appName + ' (' + appVersion + ')',
    url: homePageURL,
    debug: false,
    browserOptions: {
        title: appName + ' (' + appVersion + ')',
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
            click(event) {

                const { width, height } = mainWindow.getBounds();
                const { x, y } = mainWindow.getPosition();
    
                const dialogWidth = 300; // Width of the dialog
                const dialogHeight = 150; // Height of the dialog
    
                const centerX = x + (width - dialogWidth) / 2;
                const centerY = y + (height - dialogHeight) / 2;
    
                let onTopState = appMenu.items[0].submenu.items[0].checked;
                mainWindow.setAlwaysOnTop(false);
    
                // Show a question dialog when attempting to close the window
                dialog.showMessageBox(mainWindow, {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm Quit',
                    message: 'Are you sure you want to quit?',
                    x: centerX,
                    y: centerY
                }).then(({ response }) => {
                    mainWindow.show(); // show blured window again
                    if (response === 0) { // Yes button clicked
                        mainWindow._events.close = null; // Unreference function so that App can close
                        event.returnValue = false;
                        mainWindow.destroy(); // Close the window
                        return 0;
                    } else { // Option: No
                        // Re-set previously saved OnTop state
                        mainWindow.setAlwaysOnTop(onTopState);
                        event.preventDefault();
                        event.returnValue = true;
                        return 1;
                    }
                });		
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
                    'message': 'GPL 2.0' + '\n' +
                    appLicense
                });
            }
        }, {
            label: appName,
            click() {

                const { width, height } = mainWindow.getBounds();
                const { x, y } = mainWindow.getPosition();
            
                const dialogWidth = 300; // Width of the dialog
                const dialogHeight = 150; // Height of the dialog
            
                const centerX = x + (width - dialogWidth) / 2;
                const centerY = y + (height - dialogHeight) / 2;

                let onTopOption = mainWindow.isAlwaysOnTop();
                mainWindow.setAlwaysOnTop(false);
                mainWindow.setEnabled(false); // Disable the main window

                dialog.showMessageBox({
                    'type': 'info',
                    'title': 'About',
                    buttons: ['Close'],
                    modal: true,
                    'message': appName + '\n' +
                    'Version ' + appVersion + ' (' + appBuildId + ')' + '\n' + 
                    appCopyright + '\n' + 
                    appAuthor + '\n' + 
                    appLicense,
                    x: centerX,
                    y: centerY
                }).then(() => {
                    mainWindow.setAlwaysOnTop(onTopOption);
                    mainWindow.setEnabled(true); // Re-enable the main window when dialog is closed
                    mainWindow.focus(); // Bring the main window to front

                });
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


let mainWindow;
let appMenu = Menu.buildFromTemplate(programOptions.mainMenu);

process.name = appName;
app.setName(appName);

//var browserWindowOptions = browserOptions.push({show : false });
var browserWindowOptions = browserOptions;

// Package to parse command-line options
const { Command } = require('commander');
const program = new Command();
/*
if (process.defaultApp == true) {
      process.argv.unshift(null)
}
*/

// Function to save data to JSON file
function writeToProfileJSON(data) {

    const jsonData = JSON.stringify(data, null, 2); // Use 2 spaces for indentation
    fs.writeFileSync(nomicProfileJson, jsonData);
}

// Function to read data from JSON file
function readFromProfileJSON() {
    try {
        const data = fs.readFileSync(nomicProfileJson, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or there's an error parsing JSON, return an empty object
        return {};
    }
}

// Define command-line options
program
    .version(appVersion)
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
    .option('-d, --debug', 'Print debugging info')
    .parse(process.argv);

process.name = programOptions.title;

// Access parsed options
const options = program.opts();

if (typeof options.url === 'undefined') {
    options.url = openPageURL;
}

// Save options to Applicaton profile JSON file
writeToProfileJSON(options);

// Validate URL
try {
    const url = new URL(options.url);
    openPageURL = url.href;
} catch (error) {
    process.stdout.write('Invalid '); // no carriage return
} finally {
    console.log('URL: ', options.url);
}

if (program.title) browserWindowOptions.title = program.title;
if (program.profile) profileFilename = program.config;
if (program.iconFile) browserWindowOptions.icon = program.iconFile;
if (program.kiosk) browserWindowOptions.kiosk = true;
if (program.fullscreen) browserWindowOptions.fullscreen = true;
if (program.maximized) browserWindowOptions.maximized = true;
if (program.width) browserWindowOptions.width = program.width;
if (program.height) browserWindowOptions.width = program.height;
if (program.minwidth) browserWindowOptions.minWidth = program.minwidth;
if (program.minheight) browserWindowOptions.minWidth = program.maxheight;
if (program.maxwidth) browserWindowOptions.maxWidth = program.maxwidth;
if (program.maxheight) browserWindowOptions.maxWidth = program.maxheight;
if (program.center) browserWindowOptions.center = true;
if (program.disableMenu) browserWindowOptions.disableMenuBar = true;
if (program.autohideMenu) browserWindowOptions.autoHideMenuBar = true;
if (program.noMinimize) browserWindowOptions.minimizable = false;
if (program.noMaximize) browserWindowOptions.maximizable = false;
if (program.skipTaskbar) browserWindowOptions.skipTaskBar = true;
if (program.onTop) browserWindowOptions.alwaysOnTop = true;
if (program.noResize) browserWindowOptions.resizable = false;
if (program.noBorder) browserWindowOptions.frame = false;
if (program.noCache) cacheContent = false;
if (program.devel) browserWindowOptions.devTools = true;
if (program.debug) programOptions.debug = true;


// Debug Log
if (program.debug) {
    console.log(program);
    console.log('----------------');
    console.log(require('module').globalPaths);
    console.log(require('electron'));
    console.log('----------------');
    console.log('Arguments specified: %j', process.argv);
    console.log('OpenPageURL: %j', openPageURL);
    console.log('browserWindowOptions: ');
    console.log(browserWindowOptions);
    console.log('program.args: %j', program.args);
    console.log('process.argv: %j', process.argv);
}


app.setName(appName);


// Application User Model ID (AUMID) for notifications on Windows 8/8.1/10 to function with
// multiple Electron applications. You should set different AppUserModelIDs for each application  
// to ensure that they are treated as separate entities by the Windows operating system. 
// Example: app.setAppUserModelId('com.example.myapp');
console.log(packageJson.appId);
//app.setAppUserModelId(packageJson.appId);


function createWindow() {
    // debug
    if (program.debug) {
        console.log('browserOptions: ');
        console.log(browserOptions);
        console.log('programOptions: ');
        console.log(programOptions);
        console.log('openPageURL: ' + openPageURL);
        console.log('mainMenu: ');
        console.log(programOptions.mainMenu);
    }
    // Create the browser window.
    mainWindow = new BrowserWindow(browserOptions);

    if (program.noProxy)    {
        mainWindow.webContents.session.setProxy( { pacScript : '' }, function () { return true; });
    }
    if (program.disableMenu) {
        Menu.setApplicationMenu(null);  // for MacOS
        mainWindow.setMenu(null);       // for Windows and Linux
    } else {
        Menu.setApplicationMenu(appMenu);// for MacOS
        mainWindow.setMenu(appMenu);     // for Windows and Linux
    }

    // mainWindow.loadURL('about:config', browserOptions);
    //mainWindow.loadURL(openPageURL, browserOptions);
    mainWindow.loadURL(openPageURL);

    mainWindow.on('show', function () {
		mainWindow.on('close', onBeforeUnload);
    });

	mainWindow.on('page-title-updated', function (event) {
		event.preventDefault();
		mainWindow.setTitle(appName + ' - ' + mainWindow.webContents.getTitle());
	});
	/*
    mainWindow.webContents.on('did-finish-load', function () {
	    mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
    });
  */
    mainWindow.on('minimize', function () {
    });

    // Emitted when the window is going to be closed, but it's still opened.
    mainWindow.on('close', onBeforeUnload);

    mainWindow.webContents.on('did-start-loading', function () {
		// console.log(mainWindow.webContents.canGoBack());
		// Enable/Disable Navigation subMenu item "Back"
//		if (mainWindow.webContents.canGoBack()) {
//			appMenu.items[1].submenu.items[2].enabled = true;
//		} else {
//			appMenu.items[1].submenu.items[2].enabled = false;
//		}
		// Enable/Disable Navigation subMenu item "Forward"
//		if (mainWindow.webContents.canGoForward()) {
//			appMenu.items[1].submenu.items[4].enabled = true;
//		} else {
//			appMenu.items[1].submenu.items[4].enabled = false;
//		}
	});

    // prevent a new window of being created (ex: target='_blank', etc.)
	mainWindow.webContents.on('new-window', (event, url) => {
		event.preventDefault(); // Prevent the default behavior
		mainWindow.loadURL(url); // Load the URL in the main window
	});

	// This is only used to test if the application start without any problem,
	// the application immediatly exits after this if everything is ok
	if (process.argv[2] === '--test') {
		if (mainWindow) {
			mainWindow.destroy(); // Close the window
		}
		console.log('Application Execution Test: Ok\n\r');
		app.quit();
	} else {
		mainWindow.show();
	}
	console.log('Test file: %s\n\r', homePageURL);
} // function createWindow

// Initialization is ready to create main window
app.whenReady().then(createWindow);

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


function onBeforeUnload(event) {

	event.preventDefault();
    let onTopState = browserWindow.isAlwaysOnTop();
    if (mainWindow) {
        
        const { width, height } = mainWindow.getBounds();
        const { x, y } = mainWindow.getPosition();

        const dialogWidth = 300; // Width of the dialog
        const dialogHeight = 150; // Height of the dialog

        const centerX = x + (width - dialogWidth) / 2;
        const centerY = y + (height - dialogHeight) / 2;

        browserWindow.setAlwaysOnTop(false);

        // Show a question dialog when attempting to close the window
        dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm Quit',
            message: 'Are you sure you want to quit?',
            x: centerX,
            y: centerY
        }).then(({ response }) => {
            mainWindow.show(); // show blured window again
            if (response === 0) { // Yes button clicked
                mainWindow._events.close = null; // Unreference function so that App can close
                event.returnValue = false;
                mainWindow.destroy(); // Close the window
                return 0;
            } else { // Option: No
                // Re-set previously saved OnTop state
                mainWindow.setAlwaysOnTop(onTopState);
                event.preventDefault();
                event.returnValue = true;
                return 1;
            }
        });
    } else {
        app.quit();
    }
}
