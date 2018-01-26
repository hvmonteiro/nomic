{
    title: APP_NAME + ' (' + APP_VERSION + ')',
    url: homePageURL,
    debug: false,
    browserOptions: {
        title: APP_NAME + ' (' + APP_VERSION + ')',
        icon: path.join(__dirname, '/nomic.ico'),
        fullscreen: false,
        kiosk: false,
        maximized: false,
        width: 0,
        height: 0,
        minWidth: 0,
        minHeight: 0,
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
                mainWindow.loadURL('file://' + path.join(__dirname, '/usage.txt'), browserOptions);
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
            label: APP_NAME,
            click: function (item, BrowserWindow) {
                let onTopOption = mainWindow.isAlwaysOnTop();
                mainWindow.setAlwaysOnTop(false);
                dialog.showMessageBox({
                    'type': 'info',
                    'title': 'About',
                    buttons: ['Close'],
                    'message': APP_NAME + '\nVersion ' + APP_VERSION + '\nGPL 2.0 License'
                });
                mainWindow.setAlwaysOnTop(onTopOption);
            }
        }]
    }],
    contextMenu: [],
    sysContextMenu : [{
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
        }]
}

