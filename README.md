# Nomic

Is a cross-platform **lightweight browser** aimed as a frontend for legacy *Web Applications* or to be used as a **Kiosk Browser**. It runs on **Windows, Linux and MacOS**.

# The Idea Behind

The typical usage aimed at creating **Nomic**, was to be used as a *independent launcher for web applications*, in such a way that the web application itself would be appear as a legacy *desktop application*, instead of a web application opened on a typical browser.

You can have several independent websites, using different browsing sessions, in separated desktop windows, running as different O.S. processes, completely eliminating the usage of a browser.

# Technologies Used
Nomic uses [Electron](https://github.com/electron/electron), [Chromium](https://www.chromium.org) and [Node.js](https://nodejs.org).


# Usage Help
```
Usage: nomic [options] <url>

Options:
   -t, --title              Sets window title
   -c FILE, --config FILE   Configuration file in JSON format with options
   --custom-menu FILE       Configuration file in JSON format to have customized menus instead of the default.
   --icon-file FILE         Icon file to use as Window icon
   --kiosk                  Launches in a kiosk mode, that is, turns the main window into a frontend for a legacy Web Application.
   -f, --fullscreen         Launches in fullscreen mode
   --maximized              Launches in a maximized window
   --width                  Sets the window Width at launch
   --height                 Sets the window Height at launch
   --minwidth               Sets the minimum Width the window is allowed to be resized to
   --minheight              Sets the minimum Height the window is allowed to be resized to
   --maxwidth               Sets the maximum Width the window is allowed to be resized to
   --maxheight              Sets the maximum Height the window is allowed to be resized to
   --center                 Centers the window in the middle of the desktop
   --disableMenu            Disables all Menus. (default: always shown)
   --autoHideMenu           Sets the Menu to automatically hide when not in use. (default: always shown)
   --minimizable            Sets if the window is allowed to be minimized. (default: true)  [true]
   --maximizable            Sets if the window is allowed to be maximized. (default: true)  [true]
   --skipTaskbar            When specified, the application window will not appear in desktop task bar.
   --resizable              Doesn't allow the window to be resizable  [true]
   --no-border              Makes the window borderless
   --cache                  Don't cache content  [true]
   -d, --debug              Print debugging info
   ```
