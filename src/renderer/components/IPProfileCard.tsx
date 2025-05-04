import React, { useEffect, useState } from 'react';
import '../styles/IPProfileCard.css';
import { IPProfile } from '../types';
import { subnetMaskToCIDR } from '../utils/subnet';
import { LucideServer, XIcon } from 'lucide-react';

export default function IPProfileCard() {
    const [profiles, setProfiles] = useState<IPProfile[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
          const initialProfiles = await window.electron.ipcRenderer.invoke('load-ip-profiles');
          setProfiles(initialProfiles);
        };
      
        fetchProfiles();
      
        const unsubscribe = window.electron.ipcRenderer.on(
          'load-ip-profiles',
          (...args: unknown[]) => {
            const profiles = args[0] as IPProfile[];
            setProfiles(profiles);
          }
        );
      
        return () => {
          unsubscribe?.();
        };
      }, []);
      
    

    return (
        <div className="card-wrapper">
            <h2 className="card-title">IP Profiles</h2>
            
            {profiles.length === 0 ? (
                <div className="card-empty">No IP profiles found</div>
            ) : (
                <div className="card-list">
                    {profiles.map((profile, index) => (
                        <div key={index} className="card-item">
                            <h3 className="card-item-title">{profile.name}:</h3>
                            <p className="card-item-ip">{profile.ip}/{subnetMaskToCIDR(profile.subnet)}</p>

                            <button className='card-item-delete' onClick={async () => {
                                    await window.electron.ipcRenderer.invoke('delete-ip-profile', profile);
                                }
                            }
                            >
                                <XIcon size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
