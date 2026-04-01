import { Menu, type MenuItemConstructorOptions } from 'electron'

const DEV_MENU_TEMPLATE: MenuItemConstructorOptions[] = [
  { role: 'appMenu' },
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  { role: 'windowMenu' },
]

export function configureAppMenu(isDev: boolean): void {
  if (!isDev) {
    return
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(DEV_MENU_TEMPLATE))
}
