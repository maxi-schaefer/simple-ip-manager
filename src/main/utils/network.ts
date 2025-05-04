import { exec } from "child_process";
import { IPProfile } from "../types";
import os from 'os';
import { Notification } from 'electron';
import { getAssetPath, showNotification } from "../main";
import path from "path";
import { removeProfileFromAdapter } from "./profiles";

export const updateNetworkSettings = (adapterName: string, profile: IPProfile, dhcp?: boolean) => {
  if(!dhcp) {
    const { name, ip, gateway, subnet, dns } = profile;
  
    // Command to set static IP and subnet
    const command = `netsh interface ip set address name="${adapterName}" static ${ip} ${subnet} ${gateway}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error applying IP settings: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Successfully applied network settings: ${stdout}`);
      showNotification('Network Settings Applied', `${name} applied to ${adapterName}`);
  
      const restartCommand = `netsh interface set interface "${adapterName}" admin=disable && netsh interface set interface "${adapterName}" admin=enable`;
  
      exec(restartCommand, (restartError, restartStdout, restartStderr) => {
        if (restartError) {
          console.error(`Error restarting the adapter: ${restartError.message}`);
          console.error(`stderr: ${restartStderr}`);
          return;
        }
        console.log(`Adapter "${adapterName}" restarted successfully: ${restartStdout}`);
      });
  
      if (dns && dns.length > 0) {
        const dnsCommand = `netsh interface ip set dns name="${adapterName}" static ${dns[0]}`;
        exec(dnsCommand, (dnsError, dnsStdout, dnsStderr) => {
          if (dnsError) {
            console.error(`Error applying DNS settings: ${dnsError.message}`);
            console.error(`stderr: ${dnsStderr}`);
          } else {
            console.log(`Successfully applied DNS settings: ${stdout}`);
          }
        });
      }
    });
  } else {
    const command = `netsh interface ip set address name="${adapterName}" dhcp`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error applying DHCP settings: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Successfully applied DHCP settings: ${stdout}`);
      showNotification('Network Reset to DHCP', `${adapterName} is now using DHCP`);
      
      const restartCommand = `netsh interface set interface "${adapterName}" admin=disable && netsh interface set interface "${adapterName}" admin=enable`;
  
      exec(restartCommand, (restartError, restartStdout, restartStderr) => {
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

// Function to get network adapters
export const getNetworkAdapters = () => {
  const interfaces = os.networkInterfaces();
  const adapterList: { name: string; ip: string; }[] = [];

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

export const resetAllAdapters = () => {
  const adapters = getNetworkAdapters();

  const defaultSettings: IPProfile = {
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
    updateNetworkSettings(adapter.name, defaultSettings, true);
  });
}