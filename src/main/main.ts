import { app, BrowserWindow, ipcMain, Tray, Menu, Notification } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';
import { IPProfile } from './types';
import { getNetworkAdapters, resetAllAdapters, updateNetworkSettings } from './utils/network';
import { deleteIPProfile, getAssignedProfileForAdapter, loadIPProfiles, removeProfileFromAdapter, saveIPProfile } from './utils/profiles';

export let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const getAdaptersSubMenu = (assignedAdapters: Set<string>, profile: IPProfile) => {
  const adapters = getNetworkAdapters();
  return adapters.map((adapter) => ({
    label: `${adapter.name}`,
    type: 'checkbox',
    checked: assignedAdapters.has(adapter.name) && profile.assignedAdapter === adapter.name,
    click: () => {
      const assignedProfile = getAssignedProfileForAdapter(adapter.name);

      if (assignedProfile && assignedProfile.name === profile.name) {
        // Remove assignment if clicked again (toggle off)
        removeProfileFromAdapter(adapter.name);
      } else {
        // Unassign current profile from any adapter
        if (profile.assignedAdapter) {
          removeProfileFromAdapter(profile.assignedAdapter);
        }

        // Reassign this profile to the clicked adapter
        profile.assignedAdapter = adapter.name;
        saveIPProfile(profile);
        updateNetworkSettings(adapter.name, profile);
        console.log(`Assigned profile "${profile.name}" to adapter ${adapter.name}`);
      }
    },
  }));
};

export const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, 'assets')
: path.join(__dirname, '../../assets');

export const getAssetPath = (...paths: string[]): string => {
return path.join(RESOURCES_PATH, ...paths);
};

const createTray = () => {

  const iconPath = getAssetPath('icon.png');
  tray = new Tray(iconPath);

  tray.setToolTip('Simple IP Manager');
  
  // Left-click event
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
    }
  });

  // Right-click event
  tray.on('right-click', () => {
    const contextMenuItems: any[] = [];

    // Add a menu item for each IP profile
    const profiles = loadIPProfiles();
    const assignedAdapters = new Set<string>();

    profiles.forEach((profile) => {
      if (profile.assignedAdapter) {
        assignedAdapters.add(profile.assignedAdapter);
      }
    
      contextMenuItems.push({
        label: profile.name,
        submenu: [
          {
            label: `Description: ${profile.description}`,
            enabled: false,
          },
          {
            label: `IP: ${profile.ip}`,
            enabled: false,
          },
          {
            label: `Gateway: ${profile.gateway}`,
            enabled: false,
          },
          {
            label: `Subnet: ${profile.subnet}`,
            enabled: false,
          },
          { type: 'separator' },
          ...getAdaptersSubMenu(assignedAdapters, profile),
        ],
      });
    });

    // Add a quit option at the bottom
    contextMenuItems.push(
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      }
    );

    // Now set the context menu with all the items
    const contextMenu = Menu.buildFromTemplate(contextMenuItems);
    tray?.popUpContextMenu(contextMenu);
  });
};

// Save IPProfile and handle IPC communication
ipcMain.on('save-ip-profile', async (event, profile: IPProfile) => {
  saveIPProfile(profile);
});

ipcMain.handle('delete-ip-profile', async (event, profile: IPProfile) => {
  deleteIPProfile(profile.name);
});

ipcMain.handle('load-ip-profiles', () => {
  const profiles = loadIPProfiles();
  return profiles;
});

ipcMain.on('close-app', () => {
  mainWindow?.hide();
});

ipcMain.on('minimize-app', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-app', () => {
  if(mainWindow?.isMaximized()) {
    mainWindow?.restore()
  } else {
    mainWindow?.maximize()
  }
});

export const showNotification = (title: string, body: string) => {
  const iconPath = path.join(__dirname, 'assets', 'icon.png'); // Adjust path as needed

  new Notification({ icon: iconPath, title, body }).show();
};

// Create the main window
const createWindow = async () => {

  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    width: 1024,
    height: 728,
    autoHideMenuBar: true,
    titleBarStyle: "customButtonsOnHover",
    title: "Simple IP Manager",
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.sim/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.setName("Simple IP Manager");

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }

  resetAllAdapters();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
