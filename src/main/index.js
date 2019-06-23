import { app, BrowserWindow , ipcMain , dialog , Tray} from 'electron'
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let mainWindow , addWindow ;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

// 创建主窗口 
function createWindow () {
  mainWindow = new BrowserWindow({
    height: 563,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 创建添加音乐窗口
function createAddWindow(){
  addWindow  = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow
  });
  addWindow.loadURL(`${winURL}/#add`);
  addWindow.on('closed', () => {
    addWindow = null
  })
}

app.on('ready',()=>{

  // 创建托盘图标
  // tray = new Tray('../../static/music.jpg');
  
  // 创建主窗口
  createWindow();
  // 打开音乐添加窗口
  ipcMain.on('add-music-window', () => {
    createAddWindow();
  });

  // 打开电脑文件选取窗口
  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Music', extensions: ['mp3'] }]
    }, (files) => {
      console.log('files',files);
      if (files) {
        event.sender.send('selected-file', files)
      }
    })
  });

  // 音乐导入
  ipcMain.on('import_music',(event,files)=>{
    // 将选取的音乐导入到页面中显示
    addWindow.hide();
    mainWindow.send('import_music',files);
  })
} )

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
