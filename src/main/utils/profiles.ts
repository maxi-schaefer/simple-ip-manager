import { IPProfile } from "../types";
import fs from 'fs';
import path from 'path';
import { updateNetworkSettings } from "./network";
import { app, ipcMain } from "electron";
import { mainWindow } from "../main";

export const saveIPProfiles = (profiles: IPProfile[]) => {
  try {
    const profileFilePath = getProfileFilePath();
    fs.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));
    console.log('Profiles saved successfully!');
  } catch (error) {
    console.error('Error saving IP profiles:', error);
  }
};

export const saveIPProfile = (profile: IPProfile) => {
  try {
    const profileFilePath = getProfileFilePath();

    let profiles: IPProfile[] = [];
    if (fs.existsSync(profileFilePath)) {
      const fileData = fs.readFileSync(profileFilePath, 'utf-8');
      profiles = JSON.parse(fileData);
    }

    // Check if profile already exists (by name) and update it
    const existingIndex = profiles.findIndex(p => p.name === profile.name);
    if (existingIndex !== -1) {
      profiles[existingIndex] = profile; // update existing
    } else {
      profiles.push(profile); // add new
    }

    fs.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));
    console.log('Profile saved successfully!');
    mainWindow?.webContents.send('load-ip-profiles', profiles);
  } catch (error) {
    console.error('Error saving IP profile:', error);
  }
};


export const deleteIPProfile = (profileName: string) => {
  try {
    const profileFilePath = getProfileFilePath();
    
    // Read the existing profiles from the file
    let profiles: IPProfile[] = [];
    if (fs.existsSync(profileFilePath)) {
      const fileData = fs.readFileSync(profileFilePath, 'utf-8');
      profiles = JSON.parse(fileData);
    }

    // Filter out the profile to be deleted
    profiles = profiles.filter(profile => profile.name !== profileName);

    // Save the updated profiles array back to the file
    fs.writeFileSync(profileFilePath, JSON.stringify(profiles, null, 2));

    console.log(`Profile "${profileName}" deleted successfully!`);
    mainWindow?.webContents.send('load-ip-profiles', profiles); // Notify the renderer process about the updated profiles
  } catch (error) {
    console.error(`Error deleting IP profile "${profileName}":`, error);
  }
};


export const getAssignedProfileForAdapter = (adapterName: string) => {
  const profiles = loadIPProfiles();
  return profiles.find(profile => profile.assignedAdapter === adapterName);
};

export const removeProfileFromAdapter = (adapterName: string) => {
  const profiles = loadIPProfiles();
  const profile = profiles.find(p => p.assignedAdapter === adapterName); // Look for profile assigned to this adapter

  // If a profile is found, remove the assignment
  if (profile) {
    profile.assignedAdapter = undefined; // Remove the adapter assignment
    
    // Save the updated profile
    saveIPProfiles(profiles);
    
    // Update network settings using system command (reset IP, subnet, gateway, DNS)
    updateNetworkSettings(adapterName, profile, true);

    console.log(`Removed profile from adapter ${adapterName}`);
  }
};

export const assignProfileToAdapter = (adapterName: string) => {
  const profiles = loadIPProfiles();
  const profile = profiles.find(p => p.assignedAdapter === undefined); // Look for profile not assigned yet

  if (profile) {
    // Assign profile to adapter
    profile.assignedAdapter = adapterName;
    
    // Save the updated profile
    saveIPProfiles(profiles);
    
    // Update network settings using system command (change IP, subnet, gateway, DNS)
    updateNetworkSettings(adapterName, profile);

    console.log(`Assigned profile "${profile.name}" to adapter ${adapterName}`);
  }
};

export const getProfileFilePath = () => {
  const appDataPath = app.getPath('appData');
  const profileDir = path.join(appDataPath, 'SimpleIPManager');
  const profileFile = path.join(profileDir, 'profiles.json');
  
  // Ensure the directory exists
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }
  
  return profileFile;
};

// Function to load all IPProfiles from the profile.json file
export const loadIPProfiles = (): IPProfile[] => {
  try {
    const profileFilePath = getProfileFilePath();

    // Check if the profile file exists
    if (!fs.existsSync(profileFilePath)) {
      console.log('No profiles found.');
      return []; // Return an empty array if no profiles exist
    }

    // Read the file and parse the JSON content
    const fileData = fs.readFileSync(profileFilePath, 'utf-8');
    const profiles: IPProfile[] = JSON.parse(fileData);
    
    return profiles;
  } catch (error) {
    console.error('Error loading IP profiles:', error);
    return []; // Return an empty array in case of error
  }
};