const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let win;
let tray;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1000,
    height: 100,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  const startURL = 'http://localhost:3000';

  const loadReactApp = () => {
    win.loadURL(startURL).catch(() => {
      setTimeout(loadReactApp, 1000);
    });
  };

  loadReactApp();
  win.setAlwaysOnTop(true, 'floating');

  tray = new Tray(path.join(__dirname, 'trayIcon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Sales Listener');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show();
  });

  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  });

  ipcMain.on('quit-app', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
