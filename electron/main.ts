import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

import { MeetingsStore } from './store'

const store = new MeetingsStore()

app.whenReady().then(() => {
  ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] })
    return sources
  })

  ipcMain.handle('get-meetings', () => store.getMeetings())
  ipcMain.handle('get-meeting', (_, id) => store.getMeeting(id))
  ipcMain.handle('save-meeting', (_, data) => store.saveMeeting(data))
  ipcMain.handle('delete-meeting', (_, id) => store.deleteMeeting(id))
  ipcMain.handle('get-settings', () => store.getSettings())
  ipcMain.handle('set-settings', (_, data) => store.setSettings(data))

  ipcMain.handle('set-window-mode', (_, mode: 'overlay' | 'dashboard') => {
    if (!win) return
    if (mode === 'overlay') {
      win.setSize(400, 600)
      win.setAlwaysOnTop(true)
    } else {
      win.setSize(1200, 800)
      win.center()
      win.setAlwaysOnTop(false)
    }
  })

  createWindow()
})
