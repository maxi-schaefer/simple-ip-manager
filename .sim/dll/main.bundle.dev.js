(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/main.ts":
/*!**************************!*\
  !*** ./src/main/main.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showNotification = exports.getAssetPath = exports.RESOURCES_PATH = exports.mainWindow = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const util_1 = __webpack_require__(/*! ./util */ "./src/main/util.ts");
const network_1 = __webpack_require__(/*! ./utils/network */ "./src/main/utils/network.ts");
const profiles_1 = __webpack_require__(/*! ./utils/profiles */ "./src/main/utils/profiles.ts");
exports.mainWindow = null;
let tray = null;
const getAdaptersSubMenu = (assignedAdapters, profile) => {
    const adapters = (0, network_1.getNetworkAdapters)();
    return adapters.map((adapter) => ({
        label: `${adapter.name}`,
        type: 'checkbox',
        checked: assignedAdapters.has(adapter.name) && profile.assignedAdapter === adapter.name,
        click: () => {
            const assignedProfile = (0, profiles_1.getAssignedProfileForAdapter)(adapter.name);
            if (assignedProfile && assignedProfile.name === profile.name) {
                // Remove assignment if clicked again (toggle off)
                (0, profiles_1.removeProfileFromAdapter)(adapter.name);
            }
            else {
                // Unassign current profile from any adapter
                if (profile.assignedAdapter) {
                    (0, profiles_1.removeProfileFromAdapter)(profile.assignedAdapter);
                }
                // Reassign this profile to the clicked adapter
                profile.assignedAdapter = adapter.name;
                (0, profiles_1.saveIPProfile)(profile);
                (0, network_1.updateNetworkSettings)(adapter.name, profile);
                console.log(`Assigned profile "${profile.name}" to adapter ${adapter.name}`);
            }
        },
    }));
};
exports.RESOURCES_PATH = electron_1.app.isPackaged
    ? path_1.default.join(process.resourcesPath, 'assets')
    : path_1.default.join(__dirname, '../../assets');
const getAssetPath = (...paths) => {
    return path_1.default.join(exports.RESOURCES_PATH, ...paths);
};
exports.getAssetPath = getAssetPath;
const createTray = () => {
    const iconPath = (0, exports.getAssetPath)('icon.png');
    tray = new electron_1.Tray(iconPath);
    tray.setToolTip('Simple IP Manager');
    // Left-click event
    tray.on('click', () => {
        if (exports.mainWindow) {
            exports.mainWindow.isVisible() ? exports.mainWindow.focus() : exports.mainWindow.show();
        }
    });
    // Right-click event
    tray.on('right-click', () => {
        const contextMenuItems = [];
        // Add a menu item for each IP profile
        const profiles = (0, profiles_1.loadIPProfiles)();
        const assignedAdapters = new Set();
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
        contextMenuItems.push({ type: 'separator' }, {
            label: 'Quit',
            click: () => {
                electron_1.app.quit();
            },
        });
        // Now set the context menu with all the items
        const contextMenu = electron_1.Menu.buildFromTemplate(contextMenuItems);
        tray?.popUpContextMenu(contextMenu);
    });
};
// Save IPProfile and handle IPC communication
electron_1.ipcMain.on('save-ip-profile', async (event, profile) => {
    (0, profiles_1.saveIPProfile)(profile);
});
electron_1.ipcMain.handle('delete-ip-profile', async (event, profile) => {
    (0, profiles_1.deleteIPProfile)(profile.name);
});
electron_1.ipcMain.handle('load-ip-profiles', () => {
    const profiles = (0, profiles_1.loadIPProfiles)();
    return profiles;
});
electron_1.ipcMain.on('close-app', () => {
    exports.mainWindow?.hide();
});
electron_1.ipcMain.on('minimize-app', () => {
    exports.mainWindow?.minimize();
});
electron_1.ipcMain.on('maximize-app', () => {
    if (exports.mainWindow?.isMaximized()) {
        exports.mainWindow?.restore();
    }
    else {
        exports.mainWindow?.maximize();
    }
});
const showNotification = (title, body) => {
    const iconPath = path_1.default.join(__dirname, 'assets', 'icon.png'); // Adjust path as needed
    new electron_1.Notification({ icon: iconPath, title, body }).show();
};
exports.showNotification = showNotification;
// Create the main window
const createWindow = async () => {
    exports.mainWindow = new electron_1.BrowserWindow({
        show: false,
        frame: false,
        width: 1024,
        height: 728,
        autoHideMenuBar: true,
        titleBarStyle: "customButtonsOnHover",
        title: "Simple IP Manager",
        icon: (0, exports.getAssetPath)('icon.png'),
        webPreferences: {
            preload: electron_1.app.isPackaged
                ? path_1.default.join(__dirname, 'preload.js')
                : path_1.default.join(__dirname, '../../.sim/dll/preload.js'),
        },
    });
    exports.mainWindow.loadURL((0, util_1.resolveHtmlPath)('index.html'));
    exports.mainWindow.on('ready-to-show', () => {
        if (!exports.mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            exports.mainWindow.minimize();
        }
        else {
            exports.mainWindow.show();
        }
    });
    exports.mainWindow.on('closed', () => {
        exports.mainWindow = null;
    });
};
electron_1.app.setName("Simple IP Manager");
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    electron_1.app.on('activate', () => {
        if (exports.mainWindow === null)
            createWindow();
    });
});
electron_1.app.on('before-quit', () => {
    if (tray) {
        tray.destroy();
        tray = null;
    }
    (0, network_1.resetAllAdapters)();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});


/***/ }),

/***/ "./src/main/util.ts":
/*!**************************!*\
  !*** ./src/main/util.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveHtmlPath = resolveHtmlPath;
/* eslint import/prefer-default-export: off */
const url_1 = __webpack_require__(/*! url */ "url");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
function resolveHtmlPath(htmlFileName) {
    if (true) {
        const port = process.env.PORT || 1212;
        const url = new url_1.URL(`http://localhost:${port}`);
        url.pathname = htmlFileName;
        return url.href;
    }
    return `file://${path_1.default.resolve(__dirname, '../renderer/', htmlFileName)}`;
}


/***/ }),

/***/ "./src/main/utils/network.ts":
/*!***********************************!*\
  !*** ./src/main/utils/network.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resetAllAdapters = exports.getNetworkAdapters = exports.updateNetworkSettings = void 0;
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const os_1 = __importDefault(__webpack_require__(/*! os */ "os"));
const main_1 = __webpack_require__(/*! ../main */ "./src/main/main.ts");
const updateNetworkSettings = (adapterName, profile, dhcp) => {
    if (!dhcp) {
        const { name, ip, gateway, subnet, dns } = profile;
        // Command to set static IP and subnet
        const command = `netsh interface ip set address name="${adapterName}" static ${ip} ${subnet} ${gateway}`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error applying IP settings: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`Successfully applied network settings: ${stdout}`);
            (0, main_1.showNotification)('Network Settings Applied', `${name} applied to ${adapterName}`);
            const restartCommand = `netsh interface set interface "${adapterName}" admin=disable && netsh interface set interface "${adapterName}" admin=enable`;
            (0, child_process_1.exec)(restartCommand, (restartError, restartStdout, restartStderr) => {
                if (restartError) {
                    console.error(`Error restarting the adapter: ${restartError.message}`);
                    console.error(`stderr: ${restartStderr}`);
                    return;
                }
                console.log(`Adapter "${adapterName}" restarted successfully: ${restartStdout}`);
            });
            if (dns && dns.length > 0) {
                const dnsCommand = `netsh interface ip set dns name="${adapterName}" static ${dns[0]}`;
                (0, child_process_1.exec)(dnsCommand, (dnsError, dnsStdout, dnsStderr) => {
                    if (dnsError) {
                        console.error(`Error applying DNS settings: ${dnsError.message}`);
                        console.error(`stderr: ${dnsStderr}`);
                    }
                    else {
                        console.log(`Successfully applied DNS settings: ${stdout}`);
                    }
                });
            }
        });
    }
    else {
        const command = `netsh interface ip set address name="${adapterName}" dhcp`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error applying DHCP settings: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`Successfully applied DHCP settings: ${stdout}`);
            (0, main_1.showNotification)('Network Reset to DHCP', `${adapterName} is now using DHCP`);
            const restartCommand = `netsh interface set interface "${adapterName}" admin=disable && netsh interface set interface "${adapterName}" admin=enable`;
            (0, child_process_1.exec)(restartCommand, (restartError, restartStdout, restartStderr) => {
                if (restartError) {
                    console.error(`Error restarting the adapter: ${restartError.message}`);
                    console.error(`stderr: ${restartStderr}`);
                    return;
                }
                console.log(`Adapter "${adapterName}" restarted successfully: ${restartStdout}`);
            });
        });
    }
};
exports.updateNetworkSettings = updateNetworkSettings;
// Function to get network adapters
const getNetworkAdapters = () => {
    const interfaces = os_1.default.networkInterfaces();
    const adapterList = [];
    for (const iface in interfaces) {
        interfaces[iface]?.forEach((details) => {
            if (details.family === 'IPv4') {
                adapterList.push({
                    name: iface,
                    ip: details.address,
                });
            }
        });
    }
    return adapterList;
};
exports.getNetworkAdapters = getNetworkAdapters;
const resetAllAdapters = () => {
    const adapters = (0, exports.getNetworkAdapters)();
    const defaultSettings = {
        name: 'Default',
        assignedAdapter: '',
        dns: [],
        ip: 'dhcp', // or static IP
        subnet: '',
        gateway: '',
        id: '0',
        description: 'Default profile',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    adapters.forEach((adapter) => {
        (0, exports.updateNetworkSettings)(adapter.name, defaultSettings, true);
    });
};
exports.resetAllAdapters = resetAllAdapters;


/***/ }),

/***/ "./src/main/utils/profiles.ts":
/*!************************************!*\
  !*** ./src/main/utils/profiles.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadIPProfiles = exports.getProfileFilePath = exports.assignProfileToAdapter = exports.removeProfileFromAdapter = exports.getAssignedProfileForAdapter = exports.deleteIPProfile = exports.saveIPProfile = exports.saveIPProfiles = void 0;
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const network_1 = __webpack_require__(/*! ./network */ "./src/main/utils/network.ts");
const electron_1 = __webpack_require__(/*! electron */ "electron");
const main_1 = __webpack_require__(/*! ../main */ "./src/main/main.ts");
const saveIPProfiles = (profiles) => {
    try {
        const profileFilePath = (0, exports.getProfileFilePath)();
        fs_1.default.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));
        console.log('Profiles saved successfully!');
    }
    catch (error) {
        console.error('Error saving IP profiles:', error);
    }
};
exports.saveIPProfiles = saveIPProfiles;
const saveIPProfile = (profile) => {
    try {
        const profileFilePath = (0, exports.getProfileFilePath)();
        let profiles = [];
        if (fs_1.default.existsSync(profileFilePath)) {
            const fileData = fs_1.default.readFileSync(profileFilePath, 'utf-8');
            profiles = JSON.parse(fileData);
        }
        // Check if profile already exists (by name) and update it
        const existingIndex = profiles.findIndex(p => p.name === profile.name);
        if (existingIndex !== -1) {
            profiles[existingIndex] = profile; // update existing
        }
        else {
            profiles.push(profile); // add new
        }
        fs_1.default.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));
        console.log('Profile saved successfully!');
        main_1.mainWindow?.webContents.send('load-ip-profiles', profiles);
    }
    catch (error) {
        console.error('Error saving IP profile:', error);
    }
};
exports.saveIPProfile = saveIPProfile;
const deleteIPProfile = (profileName) => {
    try {
        const profileFilePath = (0, exports.getProfileFilePath)();
        // Read the existing profiles from the file
        let profiles = [];
        if (fs_1.default.existsSync(profileFilePath)) {
            const fileData = fs_1.default.readFileSync(profileFilePath, 'utf-8');
            profiles = JSON.parse(fileData);
        }
        // Filter out the profile to be deleted
        profiles = profiles.filter(profile => profile.name !== profileName);
        // Save the updated profiles array back to the file
        fs_1.default.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));
        console.log(`Profile "${profileName}" deleted successfully!`);
        main_1.mainWindow?.webContents.send('load-ip-profiles', profiles); // Notify the renderer process about the updated profiles
    }
    catch (error) {
        console.error(`Error deleting IP profile "${profileName}":`, error);
    }
};
exports.deleteIPProfile = deleteIPProfile;
const getAssignedProfileForAdapter = (adapterName) => {
    const profiles = (0, exports.loadIPProfiles)();
    return profiles.find(profile => profile.assignedAdapter === adapterName);
};
exports.getAssignedProfileForAdapter = getAssignedProfileForAdapter;
const removeProfileFromAdapter = (adapterName) => {
    const profiles = (0, exports.loadIPProfiles)();
    const profile = profiles.find(p => p.assignedAdapter === adapterName); // Look for profile assigned to this adapter
    // If a profile is found, remove the assignment
    if (profile) {
        profile.assignedAdapter = undefined; // Remove the adapter assignment
        // Save the updated profile
        (0, exports.saveIPProfiles)(profiles);
        // Update network settings using system command (reset IP, subnet, gateway, DNS)
        (0, network_1.updateNetworkSettings)(adapterName, profile, true);
        console.log(`Removed profile from adapter ${adapterName}`);
    }
};
exports.removeProfileFromAdapter = removeProfileFromAdapter;
const assignProfileToAdapter = (adapterName) => {
    const profiles = (0, exports.loadIPProfiles)();
    const profile = profiles.find(p => p.assignedAdapter === undefined); // Look for profile not assigned yet
    if (profile) {
        // Assign profile to adapter
        profile.assignedAdapter = adapterName;
        // Save the updated profile
        (0, exports.saveIPProfiles)(profiles);
        // Update network settings using system command (change IP, subnet, gateway, DNS)
        (0, network_1.updateNetworkSettings)(adapterName, profile);
        console.log(`Assigned profile "${profile.name}" to adapter ${adapterName}`);
    }
};
exports.assignProfileToAdapter = assignProfileToAdapter;
const getProfileFilePath = () => {
    const appDataPath = electron_1.app.getPath('appData');
    const profileDir = path_1.default.join(appDataPath, 'SimpleIPManager');
    const profileFile = path_1.default.join(profileDir, 'profiles.json');
    // Ensure the directory exists
    if (!fs_1.default.existsSync(profileDir)) {
        fs_1.default.mkdirSync(profileDir, { recursive: true });
    }
    return profileFile;
};
exports.getProfileFilePath = getProfileFilePath;
// Function to load all IPProfiles from the profile.json file
const loadIPProfiles = () => {
    try {
        const profileFilePath = (0, exports.getProfileFilePath)();
        // Check if the profile file exists
        if (!fs_1.default.existsSync(profileFilePath)) {
            console.log('No profiles found.');
            return []; // Return an empty array if no profiles exist
        }
        // Read the file and parse the JSON content
        const fileData = fs_1.default.readFileSync(profileFilePath, 'utf-8');
        const profiles = JSON.parse(fileData);
        return profiles;
    }
    catch (error) {
        console.error('Error loading IP profiles:', error);
        return []; // Return an empty array in case of error
    }
};
exports.loadIPProfiles = loadIPProfiles;


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/main.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsT0FBTyxFQUFFLENBQUMsQ0FBQyx5Q0FBeUM7SUFDdEQsQ0FBQztBQUNILENBQUMsQ0FBQztBQW5CVyxzQkFBYyxrQkFtQnpCOzs7Ozs7Ozs7OztBQy9JRjs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaW1wbGUtaXAtbWFuYWdlci93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vc2ltcGxlLWlwLW1hbmFnZXIvLi9zcmMvbWFpbi9tYWluLnRzIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyLy4vc3JjL21haW4vdXRpbC50cyIsIndlYnBhY2s6Ly9zaW1wbGUtaXAtbWFuYWdlci8uL3NyYy9tYWluL3V0aWxzL25ldHdvcmsudHMiLCJ3ZWJwYWNrOi8vc2ltcGxlLWlwLW1hbmFnZXIvLi9zcmMvbWFpbi91dGlscy9wcm9maWxlcy50cyIsIndlYnBhY2s6Ly9zaW1wbGUtaXAtbWFuYWdlci9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwiY2hpbGRfcHJvY2Vzc1wiIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJlbGVjdHJvblwiIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJmc1wiIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJvc1wiIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vc2ltcGxlLWlwLW1hbmFnZXIvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInVybFwiIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc2ltcGxlLWlwLW1hbmFnZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3NpbXBsZS1pcC1tYW5hZ2VyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2Uge1xuXHRcdHZhciBhID0gZmFjdG9yeSgpO1xuXHRcdGZvcih2YXIgaSBpbiBhKSAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnID8gZXhwb3J0cyA6IHJvb3QpW2ldID0gYVtpXTtcblx0fVxufSkoZ2xvYmFsLCAoKSA9PiB7XG5yZXR1cm4gIiwiaW1wb3J0IHsgYXBwLCBCcm93c2VyV2luZG93LCBpcGNNYWluLCBUcmF5LCBNZW51LCBOb3RpZmljYXRpb24gfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHJlc29sdmVIdG1sUGF0aCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBJUFByb2ZpbGUgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGdldE5ldHdvcmtBZGFwdGVycywgcmVzZXRBbGxBZGFwdGVycywgdXBkYXRlTmV0d29ya1NldHRpbmdzIH0gZnJvbSAnLi91dGlscy9uZXR3b3JrJztcbmltcG9ydCB7IGRlbGV0ZUlQUHJvZmlsZSwgZ2V0QXNzaWduZWRQcm9maWxlRm9yQWRhcHRlciwgbG9hZElQUHJvZmlsZXMsIHJlbW92ZVByb2ZpbGVGcm9tQWRhcHRlciwgc2F2ZUlQUHJvZmlsZSB9IGZyb20gJy4vdXRpbHMvcHJvZmlsZXMnO1xuXG5leHBvcnQgbGV0IG1haW5XaW5kb3c6IEJyb3dzZXJXaW5kb3cgfCBudWxsID0gbnVsbDtcbmxldCB0cmF5OiBUcmF5IHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IGdldEFkYXB0ZXJzU3ViTWVudSA9IChhc3NpZ25lZEFkYXB0ZXJzOiBTZXQ8c3RyaW5nPiwgcHJvZmlsZTogSVBQcm9maWxlKSA9PiB7XG4gIGNvbnN0IGFkYXB0ZXJzID0gZ2V0TmV0d29ya0FkYXB0ZXJzKCk7XG4gIHJldHVybiBhZGFwdGVycy5tYXAoKGFkYXB0ZXIpID0+ICh7XG4gICAgbGFiZWw6IGAke2FkYXB0ZXIubmFtZX1gLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgY2hlY2tlZDogYXNzaWduZWRBZGFwdGVycy5oYXMoYWRhcHRlci5uYW1lKSAmJiBwcm9maWxlLmFzc2lnbmVkQWRhcHRlciA9PT0gYWRhcHRlci5uYW1lLFxuICAgIGNsaWNrOiAoKSA9PiB7XG4gICAgICBjb25zdCBhc3NpZ25lZFByb2ZpbGUgPSBnZXRBc3NpZ25lZFByb2ZpbGVGb3JBZGFwdGVyKGFkYXB0ZXIubmFtZSk7XG5cbiAgICAgIGlmIChhc3NpZ25lZFByb2ZpbGUgJiYgYXNzaWduZWRQcm9maWxlLm5hbWUgPT09IHByb2ZpbGUubmFtZSkge1xuICAgICAgICAvLyBSZW1vdmUgYXNzaWdubWVudCBpZiBjbGlja2VkIGFnYWluICh0b2dnbGUgb2ZmKVxuICAgICAgICByZW1vdmVQcm9maWxlRnJvbUFkYXB0ZXIoYWRhcHRlci5uYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVuYXNzaWduIGN1cnJlbnQgcHJvZmlsZSBmcm9tIGFueSBhZGFwdGVyXG4gICAgICAgIGlmIChwcm9maWxlLmFzc2lnbmVkQWRhcHRlcikge1xuICAgICAgICAgIHJlbW92ZVByb2ZpbGVGcm9tQWRhcHRlcihwcm9maWxlLmFzc2lnbmVkQWRhcHRlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFzc2lnbiB0aGlzIHByb2ZpbGUgdG8gdGhlIGNsaWNrZWQgYWRhcHRlclxuICAgICAgICBwcm9maWxlLmFzc2lnbmVkQWRhcHRlciA9IGFkYXB0ZXIubmFtZTtcbiAgICAgICAgc2F2ZUlQUHJvZmlsZShwcm9maWxlKTtcbiAgICAgICAgdXBkYXRlTmV0d29ya1NldHRpbmdzKGFkYXB0ZXIubmFtZSwgcHJvZmlsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBBc3NpZ25lZCBwcm9maWxlIFwiJHtwcm9maWxlLm5hbWV9XCIgdG8gYWRhcHRlciAke2FkYXB0ZXIubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KSk7XG59O1xuXG5leHBvcnQgY29uc3QgUkVTT1VSQ0VTX1BBVEggPSBhcHAuaXNQYWNrYWdlZFxuPyBwYXRoLmpvaW4ocHJvY2Vzcy5yZXNvdXJjZXNQYXRoLCAnYXNzZXRzJylcbjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2Fzc2V0cycpO1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzZXRQYXRoID0gKC4uLnBhdGhzOiBzdHJpbmdbXSk6IHN0cmluZyA9PiB7XG5yZXR1cm4gcGF0aC5qb2luKFJFU09VUkNFU19QQVRILCAuLi5wYXRocyk7XG59O1xuXG5jb25zdCBjcmVhdGVUcmF5ID0gKCkgPT4ge1xuXG4gIGNvbnN0IGljb25QYXRoID0gZ2V0QXNzZXRQYXRoKCdpY29uLnBuZycpO1xuICB0cmF5ID0gbmV3IFRyYXkoaWNvblBhdGgpO1xuXG4gIHRyYXkuc2V0VG9vbFRpcCgnU2ltcGxlIElQIE1hbmFnZXInKTtcbiAgXG4gIC8vIExlZnQtY2xpY2sgZXZlbnRcbiAgdHJheS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKG1haW5XaW5kb3cpIHtcbiAgICAgIG1haW5XaW5kb3cuaXNWaXNpYmxlKCkgPyBtYWluV2luZG93LmZvY3VzKCkgOiBtYWluV2luZG93LnNob3coKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFJpZ2h0LWNsaWNrIGV2ZW50XG4gIHRyYXkub24oJ3JpZ2h0LWNsaWNrJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRleHRNZW51SXRlbXM6IGFueVtdID0gW107XG5cbiAgICAvLyBBZGQgYSBtZW51IGl0ZW0gZm9yIGVhY2ggSVAgcHJvZmlsZVxuICAgIGNvbnN0IHByb2ZpbGVzID0gbG9hZElQUHJvZmlsZXMoKTtcbiAgICBjb25zdCBhc3NpZ25lZEFkYXB0ZXJzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBwcm9maWxlcy5mb3JFYWNoKChwcm9maWxlKSA9PiB7XG4gICAgICBpZiAocHJvZmlsZS5hc3NpZ25lZEFkYXB0ZXIpIHtcbiAgICAgICAgYXNzaWduZWRBZGFwdGVycy5hZGQocHJvZmlsZS5hc3NpZ25lZEFkYXB0ZXIpO1xuICAgICAgfVxuICAgIFxuICAgICAgY29udGV4dE1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgbGFiZWw6IHByb2ZpbGUubmFtZSxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBgRGVzY3JpcHRpb246ICR7cHJvZmlsZS5kZXNjcmlwdGlvbn1gLFxuICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogYElQOiAke3Byb2ZpbGUuaXB9YCxcbiAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IGBHYXRld2F5OiAke3Byb2ZpbGUuZ2F0ZXdheX1gLFxuICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogYFN1Ym5ldDogJHtwcm9maWxlLnN1Ym5ldH1gLFxuICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXG4gICAgICAgICAgLi4uZ2V0QWRhcHRlcnNTdWJNZW51KGFzc2lnbmVkQWRhcHRlcnMsIHByb2ZpbGUpLFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgYSBxdWl0IG9wdGlvbiBhdCB0aGUgYm90dG9tXG4gICAgY29udGV4dE1lbnVJdGVtcy5wdXNoKFxuICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1F1aXQnLFxuICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgIGFwcC5xdWl0KCk7XG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE5vdyBzZXQgdGhlIGNvbnRleHQgbWVudSB3aXRoIGFsbCB0aGUgaXRlbXNcbiAgICBjb25zdCBjb250ZXh0TWVudSA9IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUoY29udGV4dE1lbnVJdGVtcyk7XG4gICAgdHJheT8ucG9wVXBDb250ZXh0TWVudShjb250ZXh0TWVudSk7XG4gIH0pO1xufTtcblxuLy8gU2F2ZSBJUFByb2ZpbGUgYW5kIGhhbmRsZSBJUEMgY29tbXVuaWNhdGlvblxuaXBjTWFpbi5vbignc2F2ZS1pcC1wcm9maWxlJywgYXN5bmMgKGV2ZW50LCBwcm9maWxlOiBJUFByb2ZpbGUpID0+IHtcbiAgc2F2ZUlQUHJvZmlsZShwcm9maWxlKTtcbn0pO1xuXG5pcGNNYWluLmhhbmRsZSgnZGVsZXRlLWlwLXByb2ZpbGUnLCBhc3luYyAoZXZlbnQsIHByb2ZpbGU6IElQUHJvZmlsZSkgPT4ge1xuICBkZWxldGVJUFByb2ZpbGUocHJvZmlsZS5uYW1lKTtcbn0pO1xuXG5pcGNNYWluLmhhbmRsZSgnbG9hZC1pcC1wcm9maWxlcycsICgpID0+IHtcbiAgY29uc3QgcHJvZmlsZXMgPSBsb2FkSVBQcm9maWxlcygpO1xuICByZXR1cm4gcHJvZmlsZXM7XG59KTtcblxuaXBjTWFpbi5vbignY2xvc2UtYXBwJywgKCkgPT4ge1xuICBtYWluV2luZG93Py5oaWRlKCk7XG59KTtcblxuaXBjTWFpbi5vbignbWluaW1pemUtYXBwJywgKCkgPT4ge1xuICBtYWluV2luZG93Py5taW5pbWl6ZSgpO1xufSk7XG5cbmlwY01haW4ub24oJ21heGltaXplLWFwcCcsICgpID0+IHtcbiAgaWYobWFpbldpbmRvdz8uaXNNYXhpbWl6ZWQoKSkge1xuICAgIG1haW5XaW5kb3c/LnJlc3RvcmUoKVxuICB9IGVsc2Uge1xuICAgIG1haW5XaW5kb3c/Lm1heGltaXplKClcbiAgfVxufSk7XG5cbmV4cG9ydCBjb25zdCBzaG93Tm90aWZpY2F0aW9uID0gKHRpdGxlOiBzdHJpbmcsIGJvZHk6IHN0cmluZykgPT4ge1xuICBjb25zdCBpY29uUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdhc3NldHMnLCAnaWNvbi5wbmcnKTsgLy8gQWRqdXN0IHBhdGggYXMgbmVlZGVkXG5cbiAgbmV3IE5vdGlmaWNhdGlvbih7IGljb246IGljb25QYXRoLCB0aXRsZSwgYm9keSB9KS5zaG93KCk7XG59O1xuXG4vLyBDcmVhdGUgdGhlIG1haW4gd2luZG93XG5jb25zdCBjcmVhdGVXaW5kb3cgPSBhc3luYyAoKSA9PiB7XG5cbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBzaG93OiBmYWxzZSxcbiAgICBmcmFtZTogZmFsc2UsXG4gICAgd2lkdGg6IDEwMjQsXG4gICAgaGVpZ2h0OiA3MjgsXG4gICAgYXV0b0hpZGVNZW51QmFyOiB0cnVlLFxuICAgIHRpdGxlQmFyU3R5bGU6IFwiY3VzdG9tQnV0dG9uc09uSG92ZXJcIixcbiAgICB0aXRsZTogXCJTaW1wbGUgSVAgTWFuYWdlclwiLFxuICAgIGljb246IGdldEFzc2V0UGF0aCgnaWNvbi5wbmcnKSxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgcHJlbG9hZDogYXBwLmlzUGFja2FnZWRcbiAgICAgICAgPyBwYXRoLmpvaW4oX19kaXJuYW1lLCAncHJlbG9hZC5qcycpXG4gICAgICAgIDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy5zaW0vZGxsL3ByZWxvYWQuanMnKSxcbiAgICB9LFxuICB9KTtcblxuICBtYWluV2luZG93LmxvYWRVUkwocmVzb2x2ZUh0bWxQYXRoKCdpbmRleC5odG1sJykpO1xuXG4gIG1haW5XaW5kb3cub24oJ3JlYWR5LXRvLXNob3cnLCAoKSA9PiB7XG4gICAgaWYgKCFtYWluV2luZG93KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wibWFpbldpbmRvd1wiIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5TVEFSVF9NSU5JTUlaRUQpIHtcbiAgICAgIG1haW5XaW5kb3cubWluaW1pemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFpbldpbmRvdy5zaG93KCk7XG4gICAgfVxuICB9KTtcblxuICBtYWluV2luZG93Lm9uKCdjbG9zZWQnLCAoKSA9PiB7XG4gICAgbWFpbldpbmRvdyA9IG51bGw7XG4gIH0pO1xufTtcblxuYXBwLnNldE5hbWUoXCJTaW1wbGUgSVAgTWFuYWdlclwiKTtcblxuYXBwLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4ge1xuICBjcmVhdGVXaW5kb3coKTtcbiAgY3JlYXRlVHJheSgpO1xuICBhcHAub24oJ2FjdGl2YXRlJywgKCkgPT4ge1xuICAgIGlmIChtYWluV2luZG93ID09PSBudWxsKSBjcmVhdGVXaW5kb3coKTtcbiAgfSk7XG59KTtcblxuYXBwLm9uKCdiZWZvcmUtcXVpdCcsICgpID0+IHtcbiAgaWYgKHRyYXkpIHtcbiAgICB0cmF5LmRlc3Ryb3koKTtcbiAgICB0cmF5ID0gbnVsbDtcbiAgfVxuXG4gIHJlc2V0QWxsQWRhcHRlcnMoKTtcbn0pO1xuXG5hcHAub24oJ3dpbmRvdy1hbGwtY2xvc2VkJywgKCkgPT4ge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcbiAgICBhcHAucXVpdCgpO1xuICB9XG59KTtcbiIsIi8qIGVzbGludCBpbXBvcnQvcHJlZmVyLWRlZmF1bHQtZXhwb3J0OiBvZmYgKi9cbmltcG9ydCB7IFVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVIdG1sUGF0aChodG1sRmlsZU5hbWU6IHN0cmluZykge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBjb25zdCBwb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCAxMjEyO1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xuICAgIHVybC5wYXRobmFtZSA9IGh0bWxGaWxlTmFtZTtcbiAgICByZXR1cm4gdXJsLmhyZWY7XG4gIH1cbiAgcmV0dXJuIGBmaWxlOi8vJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vcmVuZGVyZXIvJywgaHRtbEZpbGVOYW1lKX1gO1xufVxuIiwiaW1wb3J0IHsgZXhlYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCB7IElQUHJvZmlsZSB9IGZyb20gXCIuLi90eXBlc1wiO1xyXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgeyBOb3RpZmljYXRpb24gfSBmcm9tICdlbGVjdHJvbic7XHJcbmltcG9ydCB7IGdldEFzc2V0UGF0aCwgc2hvd05vdGlmaWNhdGlvbiB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IHJlbW92ZVByb2ZpbGVGcm9tQWRhcHRlciB9IGZyb20gXCIuL3Byb2ZpbGVzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlTmV0d29ya1NldHRpbmdzID0gKGFkYXB0ZXJOYW1lOiBzdHJpbmcsIHByb2ZpbGU6IElQUHJvZmlsZSwgZGhjcD86IGJvb2xlYW4pID0+IHtcclxuICBpZighZGhjcCkge1xyXG4gICAgY29uc3QgeyBuYW1lLCBpcCwgZ2F0ZXdheSwgc3VibmV0LCBkbnMgfSA9IHByb2ZpbGU7XHJcbiAgXHJcbiAgICAvLyBDb21tYW5kIHRvIHNldCBzdGF0aWMgSVAgYW5kIHN1Ym5ldFxyXG4gICAgY29uc3QgY29tbWFuZCA9IGBuZXRzaCBpbnRlcmZhY2UgaXAgc2V0IGFkZHJlc3MgbmFtZT1cIiR7YWRhcHRlck5hbWV9XCIgc3RhdGljICR7aXB9ICR7c3VibmV0fSAke2dhdGV3YXl9YDtcclxuICBcclxuICAgIGV4ZWMoY29tbWFuZCwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhcHBseWluZyBJUCBzZXR0aW5nczogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHN0ZGVycjogJHtzdGRlcnJ9YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKGBTdWNjZXNzZnVsbHkgYXBwbGllZCBuZXR3b3JrIHNldHRpbmdzOiAke3N0ZG91dH1gKTtcclxuICAgICAgc2hvd05vdGlmaWNhdGlvbignTmV0d29yayBTZXR0aW5ncyBBcHBsaWVkJywgYCR7bmFtZX0gYXBwbGllZCB0byAke2FkYXB0ZXJOYW1lfWApO1xyXG4gIFxyXG4gICAgICBjb25zdCByZXN0YXJ0Q29tbWFuZCA9IGBuZXRzaCBpbnRlcmZhY2Ugc2V0IGludGVyZmFjZSBcIiR7YWRhcHRlck5hbWV9XCIgYWRtaW49ZGlzYWJsZSAmJiBuZXRzaCBpbnRlcmZhY2Ugc2V0IGludGVyZmFjZSBcIiR7YWRhcHRlck5hbWV9XCIgYWRtaW49ZW5hYmxlYDtcclxuICBcclxuICAgICAgZXhlYyhyZXN0YXJ0Q29tbWFuZCwgKHJlc3RhcnRFcnJvciwgcmVzdGFydFN0ZG91dCwgcmVzdGFydFN0ZGVycikgPT4ge1xyXG4gICAgICAgIGlmIChyZXN0YXJ0RXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHJlc3RhcnRpbmcgdGhlIGFkYXB0ZXI6ICR7cmVzdGFydEVycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBzdGRlcnI6ICR7cmVzdGFydFN0ZGVycn1gKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coYEFkYXB0ZXIgXCIke2FkYXB0ZXJOYW1lfVwiIHJlc3RhcnRlZCBzdWNjZXNzZnVsbHk6ICR7cmVzdGFydFN0ZG91dH1gKTtcclxuICAgICAgfSk7XHJcbiAgXHJcbiAgICAgIGlmIChkbnMgJiYgZG5zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBkbnNDb21tYW5kID0gYG5ldHNoIGludGVyZmFjZSBpcCBzZXQgZG5zIG5hbWU9XCIke2FkYXB0ZXJOYW1lfVwiIHN0YXRpYyAke2Ruc1swXX1gO1xyXG4gICAgICAgIGV4ZWMoZG5zQ29tbWFuZCwgKGRuc0Vycm9yLCBkbnNTdGRvdXQsIGRuc1N0ZGVycikgPT4ge1xyXG4gICAgICAgICAgaWYgKGRuc0Vycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGFwcGx5aW5nIEROUyBzZXR0aW5nczogJHtkbnNFcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBzdGRlcnI6ICR7ZG5zU3RkZXJyfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBhcHBsaWVkIEROUyBzZXR0aW5nczogJHtzdGRvdXR9YCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zdCBjb21tYW5kID0gYG5ldHNoIGludGVyZmFjZSBpcCBzZXQgYWRkcmVzcyBuYW1lPVwiJHthZGFwdGVyTmFtZX1cIiBkaGNwYDtcclxuICAgIGV4ZWMoY29tbWFuZCwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBhcHBseWluZyBESENQIHNldHRpbmdzOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgc3RkZXJyOiAke3N0ZGVycn1gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBhcHBsaWVkIERIQ1Agc2V0dGluZ3M6ICR7c3Rkb3V0fWApO1xyXG4gICAgICBzaG93Tm90aWZpY2F0aW9uKCdOZXR3b3JrIFJlc2V0IHRvIERIQ1AnLCBgJHthZGFwdGVyTmFtZX0gaXMgbm93IHVzaW5nIERIQ1BgKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IHJlc3RhcnRDb21tYW5kID0gYG5ldHNoIGludGVyZmFjZSBzZXQgaW50ZXJmYWNlIFwiJHthZGFwdGVyTmFtZX1cIiBhZG1pbj1kaXNhYmxlICYmIG5ldHNoIGludGVyZmFjZSBzZXQgaW50ZXJmYWNlIFwiJHthZGFwdGVyTmFtZX1cIiBhZG1pbj1lbmFibGVgO1xyXG4gIFxyXG4gICAgICBleGVjKHJlc3RhcnRDb21tYW5kLCAocmVzdGFydEVycm9yLCByZXN0YXJ0U3Rkb3V0LCByZXN0YXJ0U3RkZXJyKSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3RhcnRFcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgcmVzdGFydGluZyB0aGUgYWRhcHRlcjogJHtyZXN0YXJ0RXJyb3IubWVzc2FnZX1gKTtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHN0ZGVycjogJHtyZXN0YXJ0U3RkZXJyfWApO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhgQWRhcHRlciBcIiR7YWRhcHRlck5hbWV9XCIgcmVzdGFydGVkIHN1Y2Nlc3NmdWxseTogJHtyZXN0YXJ0U3Rkb3V0fWApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxufTtcclxuXHJcbi8vIEZ1bmN0aW9uIHRvIGdldCBuZXR3b3JrIGFkYXB0ZXJzXHJcbmV4cG9ydCBjb25zdCBnZXROZXR3b3JrQWRhcHRlcnMgPSAoKSA9PiB7XHJcbiAgY29uc3QgaW50ZXJmYWNlcyA9IG9zLm5ldHdvcmtJbnRlcmZhY2VzKCk7XHJcbiAgY29uc3QgYWRhcHRlckxpc3Q6IHsgbmFtZTogc3RyaW5nOyBpcDogc3RyaW5nOyB9W10gPSBbXTtcclxuXHJcbiAgZm9yIChjb25zdCBpZmFjZSBpbiBpbnRlcmZhY2VzKSB7XHJcbiAgICBpbnRlcmZhY2VzW2lmYWNlXT8uZm9yRWFjaCgoZGV0YWlscykgPT4ge1xyXG4gICAgICBpZiAoZGV0YWlscy5mYW1pbHkgPT09ICdJUHY0Jykge1xyXG4gICAgICAgIGFkYXB0ZXJMaXN0LnB1c2goe1xyXG4gICAgICAgICAgbmFtZTogaWZhY2UsXHJcbiAgICAgICAgICBpcDogZGV0YWlscy5hZGRyZXNzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBhZGFwdGVyTGlzdDtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXNldEFsbEFkYXB0ZXJzID0gKCkgPT4ge1xyXG4gIGNvbnN0IGFkYXB0ZXJzID0gZ2V0TmV0d29ya0FkYXB0ZXJzKCk7XHJcblxyXG4gIGNvbnN0IGRlZmF1bHRTZXR0aW5nczogSVBQcm9maWxlID0ge1xyXG4gICAgbmFtZTogJ0RlZmF1bHQnLFxyXG4gICAgYXNzaWduZWRBZGFwdGVyOiAnJyxcclxuICAgIGRuczogW10sXHJcbiAgICBpcDogJ2RoY3AnLCAvLyBvciBzdGF0aWMgSVBcclxuICAgIHN1Ym5ldDogJycsXHJcbiAgICBnYXRld2F5OiAnJyxcclxuICAgIGlkOiAnMCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgcHJvZmlsZScsXHJcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXHJcbiAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCksXHJcbiAgfTtcclxuXHJcbiAgYWRhcHRlcnMuZm9yRWFjaCgoYWRhcHRlcikgPT4ge1xyXG4gICAgdXBkYXRlTmV0d29ya1NldHRpbmdzKGFkYXB0ZXIubmFtZSwgZGVmYXVsdFNldHRpbmdzLCB0cnVlKTtcclxuICB9KTtcclxufSIsImltcG9ydCB7IElQUHJvZmlsZSB9IGZyb20gXCIuLi90eXBlc1wiO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgdXBkYXRlTmV0d29ya1NldHRpbmdzIH0gZnJvbSBcIi4vbmV0d29ya1wiO1xyXG5pbXBvcnQgeyBhcHAsIGlwY01haW4gfSBmcm9tIFwiZWxlY3Ryb25cIjtcclxuaW1wb3J0IHsgbWFpbldpbmRvdyB9IGZyb20gXCIuLi9tYWluXCI7XHJcblxyXG5leHBvcnQgY29uc3Qgc2F2ZUlQUHJvZmlsZXMgPSAocHJvZmlsZXM6IElQUHJvZmlsZVtdKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHByb2ZpbGVGaWxlUGF0aCA9IGdldFByb2ZpbGVGaWxlUGF0aCgpO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhwcm9maWxlRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KHByb2ZpbGVzLCBudWxsLCAyKSk7XHJcbiAgICBjb25zb2xlLmxvZygnUHJvZmlsZXMgc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgSVAgcHJvZmlsZXM6JywgZXJyb3IpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzYXZlSVBQcm9maWxlID0gKHByb2ZpbGU6IElQUHJvZmlsZSkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm9maWxlRmlsZVBhdGggPSBnZXRQcm9maWxlRmlsZVBhdGgoKTtcclxuXHJcbiAgICBsZXQgcHJvZmlsZXM6IElQUHJvZmlsZVtdID0gW107XHJcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwcm9maWxlRmlsZVBhdGgpKSB7XHJcbiAgICAgIGNvbnN0IGZpbGVEYXRhID0gZnMucmVhZEZpbGVTeW5jKHByb2ZpbGVGaWxlUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgIHByb2ZpbGVzID0gSlNPTi5wYXJzZShmaWxlRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgcHJvZmlsZSBhbHJlYWR5IGV4aXN0cyAoYnkgbmFtZSkgYW5kIHVwZGF0ZSBpdFxyXG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IHByb2ZpbGVzLmZpbmRJbmRleChwID0+IHAubmFtZSA9PT0gcHJvZmlsZS5uYW1lKTtcclxuICAgIGlmIChleGlzdGluZ0luZGV4ICE9PSAtMSkge1xyXG4gICAgICBwcm9maWxlc1tleGlzdGluZ0luZGV4XSA9IHByb2ZpbGU7IC8vIHVwZGF0ZSBleGlzdGluZ1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcHJvZmlsZXMucHVzaChwcm9maWxlKTsgLy8gYWRkIG5ld1xyXG4gICAgfVxyXG5cclxuICAgIGZzLndyaXRlRmlsZVN5bmMocHJvZmlsZUZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShwcm9maWxlcywgbnVsbCwgMikpO1xyXG4gICAgY29uc29sZS5sb2coJ1Byb2ZpbGUgc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gICAgbWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbG9hZC1pcC1wcm9maWxlcycsIHByb2ZpbGVzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIElQIHByb2ZpbGU6JywgZXJyb3IpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG5leHBvcnQgY29uc3QgZGVsZXRlSVBQcm9maWxlID0gKHByb2ZpbGVOYW1lOiBzdHJpbmcpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcHJvZmlsZUZpbGVQYXRoID0gZ2V0UHJvZmlsZUZpbGVQYXRoKCk7XHJcbiAgICBcclxuICAgIC8vIFJlYWQgdGhlIGV4aXN0aW5nIHByb2ZpbGVzIGZyb20gdGhlIGZpbGVcclxuICAgIGxldCBwcm9maWxlczogSVBQcm9maWxlW10gPSBbXTtcclxuICAgIGlmIChmcy5leGlzdHNTeW5jKHByb2ZpbGVGaWxlUGF0aCkpIHtcclxuICAgICAgY29uc3QgZmlsZURhdGEgPSBmcy5yZWFkRmlsZVN5bmMocHJvZmlsZUZpbGVQYXRoLCAndXRmLTgnKTtcclxuICAgICAgcHJvZmlsZXMgPSBKU09OLnBhcnNlKGZpbGVEYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaWx0ZXIgb3V0IHRoZSBwcm9maWxlIHRvIGJlIGRlbGV0ZWRcclxuICAgIHByb2ZpbGVzID0gcHJvZmlsZXMuZmlsdGVyKHByb2ZpbGUgPT4gcHJvZmlsZS5uYW1lICE9PSBwcm9maWxlTmFtZSk7XHJcblxyXG4gICAgLy8gU2F2ZSB0aGUgdXBkYXRlZCBwcm9maWxlcyBhcnJheSBiYWNrIHRvIHRoZSBmaWxlXHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKHByb2ZpbGVGaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkocHJvZmlsZXMsIG51bGwsIDIpKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhgUHJvZmlsZSBcIiR7cHJvZmlsZU5hbWV9XCIgZGVsZXRlZCBzdWNjZXNzZnVsbHkhYCk7XHJcbiAgICBtYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdsb2FkLWlwLXByb2ZpbGVzJywgcHJvZmlsZXMpOyAvLyBOb3RpZnkgdGhlIHJlbmRlcmVyIHByb2Nlc3MgYWJvdXQgdGhlIHVwZGF0ZWQgcHJvZmlsZXNcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZGVsZXRpbmcgSVAgcHJvZmlsZSBcIiR7cHJvZmlsZU5hbWV9XCI6YCwgZXJyb3IpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0QXNzaWduZWRQcm9maWxlRm9yQWRhcHRlciA9IChhZGFwdGVyTmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgcHJvZmlsZXMgPSBsb2FkSVBQcm9maWxlcygpO1xyXG4gIHJldHVybiBwcm9maWxlcy5maW5kKHByb2ZpbGUgPT4gcHJvZmlsZS5hc3NpZ25lZEFkYXB0ZXIgPT09IGFkYXB0ZXJOYW1lKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZW1vdmVQcm9maWxlRnJvbUFkYXB0ZXIgPSAoYWRhcHRlck5hbWU6IHN0cmluZykgPT4ge1xyXG4gIGNvbnN0IHByb2ZpbGVzID0gbG9hZElQUHJvZmlsZXMoKTtcclxuICBjb25zdCBwcm9maWxlID0gcHJvZmlsZXMuZmluZChwID0+IHAuYXNzaWduZWRBZGFwdGVyID09PSBhZGFwdGVyTmFtZSk7IC8vIExvb2sgZm9yIHByb2ZpbGUgYXNzaWduZWQgdG8gdGhpcyBhZGFwdGVyXHJcblxyXG4gIC8vIElmIGEgcHJvZmlsZSBpcyBmb3VuZCwgcmVtb3ZlIHRoZSBhc3NpZ25tZW50XHJcbiAgaWYgKHByb2ZpbGUpIHtcclxuICAgIHByb2ZpbGUuYXNzaWduZWRBZGFwdGVyID0gdW5kZWZpbmVkOyAvLyBSZW1vdmUgdGhlIGFkYXB0ZXIgYXNzaWdubWVudFxyXG4gICAgXHJcbiAgICAvLyBTYXZlIHRoZSB1cGRhdGVkIHByb2ZpbGVcclxuICAgIHNhdmVJUFByb2ZpbGVzKHByb2ZpbGVzKTtcclxuICAgIFxyXG4gICAgLy8gVXBkYXRlIG5ldHdvcmsgc2V0dGluZ3MgdXNpbmcgc3lzdGVtIGNvbW1hbmQgKHJlc2V0IElQLCBzdWJuZXQsIGdhdGV3YXksIEROUylcclxuICAgIHVwZGF0ZU5ldHdvcmtTZXR0aW5ncyhhZGFwdGVyTmFtZSwgcHJvZmlsZSwgdHJ1ZSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coYFJlbW92ZWQgcHJvZmlsZSBmcm9tIGFkYXB0ZXIgJHthZGFwdGVyTmFtZX1gKTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgYXNzaWduUHJvZmlsZVRvQWRhcHRlciA9IChhZGFwdGVyTmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgcHJvZmlsZXMgPSBsb2FkSVBQcm9maWxlcygpO1xyXG4gIGNvbnN0IHByb2ZpbGUgPSBwcm9maWxlcy5maW5kKHAgPT4gcC5hc3NpZ25lZEFkYXB0ZXIgPT09IHVuZGVmaW5lZCk7IC8vIExvb2sgZm9yIHByb2ZpbGUgbm90IGFzc2lnbmVkIHlldFxyXG5cclxuICBpZiAocHJvZmlsZSkge1xyXG4gICAgLy8gQXNzaWduIHByb2ZpbGUgdG8gYWRhcHRlclxyXG4gICAgcHJvZmlsZS5hc3NpZ25lZEFkYXB0ZXIgPSBhZGFwdGVyTmFtZTtcclxuICAgIFxyXG4gICAgLy8gU2F2ZSB0aGUgdXBkYXRlZCBwcm9maWxlXHJcbiAgICBzYXZlSVBQcm9maWxlcyhwcm9maWxlcyk7XHJcbiAgICBcclxuICAgIC8vIFVwZGF0ZSBuZXR3b3JrIHNldHRpbmdzIHVzaW5nIHN5c3RlbSBjb21tYW5kIChjaGFuZ2UgSVAsIHN1Ym5ldCwgZ2F0ZXdheSwgRE5TKVxyXG4gICAgdXBkYXRlTmV0d29ya1NldHRpbmdzKGFkYXB0ZXJOYW1lLCBwcm9maWxlKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhgQXNzaWduZWQgcHJvZmlsZSBcIiR7cHJvZmlsZS5uYW1lfVwiIHRvIGFkYXB0ZXIgJHthZGFwdGVyTmFtZX1gKTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UHJvZmlsZUZpbGVQYXRoID0gKCkgPT4ge1xyXG4gIGNvbnN0IGFwcERhdGFQYXRoID0gYXBwLmdldFBhdGgoJ2FwcERhdGEnKTtcclxuICBjb25zdCBwcm9maWxlRGlyID0gcGF0aC5qb2luKGFwcERhdGFQYXRoLCAnU2ltcGxlSVBNYW5hZ2VyJyk7XHJcbiAgY29uc3QgcHJvZmlsZUZpbGUgPSBwYXRoLmpvaW4ocHJvZmlsZURpciwgJ3Byb2ZpbGVzLmpzb24nKTtcclxuICBcclxuICAvLyBFbnN1cmUgdGhlIGRpcmVjdG9yeSBleGlzdHNcclxuICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZmlsZURpcikpIHtcclxuICAgIGZzLm1rZGlyU3luYyhwcm9maWxlRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICB9XHJcbiAgXHJcbiAgcmV0dXJuIHByb2ZpbGVGaWxlO1xyXG59O1xyXG5cclxuLy8gRnVuY3Rpb24gdG8gbG9hZCBhbGwgSVBQcm9maWxlcyBmcm9tIHRoZSBwcm9maWxlLmpzb24gZmlsZVxyXG5leHBvcnQgY29uc3QgbG9hZElQUHJvZmlsZXMgPSAoKTogSVBQcm9maWxlW10gPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwcm9maWxlRmlsZVBhdGggPSBnZXRQcm9maWxlRmlsZVBhdGgoKTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiB0aGUgcHJvZmlsZSBmaWxlIGV4aXN0c1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2ZpbGVGaWxlUGF0aCkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ05vIHByb2ZpbGVzIGZvdW5kLicpO1xyXG4gICAgICByZXR1cm4gW107IC8vIFJldHVybiBhbiBlbXB0eSBhcnJheSBpZiBubyBwcm9maWxlcyBleGlzdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlYWQgdGhlIGZpbGUgYW5kIHBhcnNlIHRoZSBKU09OIGNvbnRlbnRcclxuICAgIGNvbnN0IGZpbGVEYXRhID0gZnMucmVhZEZpbGVTeW5jKHByb2ZpbGVGaWxlUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICBjb25zdCBwcm9maWxlczogSVBQcm9maWxlW10gPSBKU09OLnBhcnNlKGZpbGVEYXRhKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHByb2ZpbGVzO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIElQIHByb2ZpbGVzOicsIGVycm9yKTtcclxuICAgIHJldHVybiBbXTsgLy8gUmV0dXJuIGFuIGVtcHR5IGFycmF5IGluIGNhc2Ugb2YgZXJyb3JcclxuICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJvc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInVybFwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvbWFpbi9tYWluLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9