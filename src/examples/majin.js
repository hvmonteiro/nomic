
var applicationOptions = [{

  "appName": "vjson.name",
  "appVersion": "vjson.version",
  "appBuildID": "vjson.buildID",
  "appCopyright": "vjson.copyright",
  "appLicense": "vjson.license",
  "appWebURL": "vjson.homepageURL",
  "appSupportURL": "vjson.supportURL"

}]
// const homePageURL = 'file://' + path.join(__dirname, 'majin.html');
const homePageURL = 'http://majin.info/start';


// Main Menu
var mainMenu = [{
  label: menuName,
  submenu: [{
    label: 'On Top',
    accelerator: 'CmdOrCtrl+T',
    type: 'checkbox',
    checked: true,
    click: function (item, BrowserWindow) {
      mainWindow.setAlwaysOnTop(item.checked);
      contextMenu.items[1].checked = item.checked;
      trayIcon.setContextMenu(contextMenu);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Minimize to Tray ',
    accelerator: 'CmdOrCtrl+Z',
    type: 'checkbox',
    checked: true
  }, {
    label: 'Close to Tray ',
    type: 'checkbox',
    checked: true
  }, {
    type: 'separator'
  }, {
    label: 'Auto-Hide Menu Bar',
    type: 'checkbox',
    checked: false,
    click: function (item, BrowserWindow) {
      mainWindow.setAutoHideMenuBar(item.checked);
      mainWindow.setMenuBarVisibility(!item.checked);
      contextMenu.items[3].checked = item.checked;
      trayIcon.setContextMenu(contextMenu);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, BrowserWindow) {
      if (mainWindow) {
        mainWindow._events.close = null; // Unreference function show that App can close
        app.quit();
      }
    }
  }
]}, {
  label: 'Navigation',
  submenu: [{
    label: 'Home',
    accelerator: 'CmdOrCtrl+H',
    click: function (item, BrowserWindow) {
      mainWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Back',
    enabled: false,
    accelerator: 'Alt+Left',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.webContents.goBack();
    }
  }, {
    label: 'Reload',
    accelerator: 'F5',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.reload();
    }
  }, {
    label: 'Forward',
    enabled: false,
    accelerator: 'Alt+Right',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.webContents.goForward();
    }
  }
]}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal(appWebURL);
    }
  }, {
    label: 'Support',
    click: function () {
      electron.shell.openExternal(appSupportURL);
    }
  }, {
    label: 'About',
    click: function (item, BrowserWindow) {
      let onTopOption = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(false);
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': appName + '\nVersion ' + appVersion + ' (' + appBuildID + ')' + '\n' + appCopyright + '\n' + appLicense
      });
      mainWindow.setAlwaysOnTop(onTopOption);
    }
  }]
}];


// SystemTray Menu
var syscontextMenu = [{
  label: 'Show Window',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      item.checked = false;
    } else {
      mainWindow.show();
      item.checked = true;
    }
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    mainWindow.setAlwaysOnTop(item.checked);
    appMenu.items[0].submenu.items[0].checked = item.checked;
  }
}, {
  type: 'separator'
}, {
  label: 'Auto-Hide Menu Bar',
  type: 'checkbox',
  checked: false,
  click: function (item, BrowserWindow) {
    mainWindow.setAutoHideMenuBar(item.checked);
    mainWindow.setMenuBarVisibility(!item.checked);
    appMenu.items[0].submenu.items[5].checked = item.checked;
  }
}, {
  label: 'Quit',
  accelerator: 'CmdOrCtrl+Q',
  click: function (item, BrowserWindow) {
    if (mainWindow) {
      mainWindow._events.close = null; // Unreference function show that App can close
      app.quit();
    }
  }
}];

// Browser window options
var mainWindowOptions = ({
    title: appName,
    width: 400,
    height: 400,
    minWidth: 400,
    minHeight: 250,
    // maxWidth: 400,
    // maxHeight: 400,
    autoHideMenuBar: false,
    maximizable: false,
    skipTaskbar: false,
    resizable: true,
    // closable: false,
    show: false,
    icon: path.join(__dirname, 'assets/icons/png/32x32.png')
  });

