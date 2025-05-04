import React, { useState } from 'react';
import '../styles/IPProfileForm.css'; // Assuming you have a CSS file for styling
import OctetInputGroup from './OctetInputGroup';
import { XIcon } from 'lucide-react';

export default function IPProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ip: '',
    gateway: '',
    dns: [''],
    subnet: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
    const { name, value } = e.target;
    if (name === 'dns' && index !== undefined) {
      const updatedDns = [...(formData.dns || [])];
      updatedDns[index] = value;
      setFormData(prev => ({ ...prev, dns: updatedDns }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeDnsField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dns: prev.dns.filter((_, i) => i !== index)
    }));
  };  

  const addDnsField = () => {
    setFormData(prev => ({ ...prev, dns: [...(prev.dns || []), ''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profile = {
      id: Date.now().toString(), // Generate a unique ID (use any other method you prefer)
      name: formData.name,
      description: formData.description,
      ip: formData.ip,
      gateway: formData.gateway,
      dns: formData.dns,
      subnet: formData.subnet,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Send the profile to the backend via IPC
    await window.electron.ipcRenderer.sendMessage('save-ip-profile', profile);

    setFormData({
      name: '',
      description: '',
      ip: '',
      gateway: '',
      dns: [''],
      subnet: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-wrapper">
      <h2 className="form-title">New IP Profile</h2>

      <div className="form-group">
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <OctetInputGroup
            label="IP Address"
            value={formData.ip}
            onChange={(val) => setFormData(prev => ({ ...prev, ip: val }))}
        />

        <OctetInputGroup
            label="Gateway"
            value={formData.gateway}
            onChange={(val) => setFormData(prev => ({ ...prev, gateway: val }))}
        />

        <OctetInputGroup
            label="Subnet"
            value={formData.subnet}
            onChange={(val) => setFormData(prev => ({ ...prev, subnet: val }))}
        />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />

        <div className="dns-section">
            {formData.dns?.map((dns, idx) => (
                <div key={idx} className="dns-entry">
                  <OctetInputGroup
                      label={`DNS ${idx + 1}`}
                      value={dns}
                      onChange={(val) => {
                        const updatedDns = [...(formData.dns || [])];
                        updatedDns[idx] = val;
                        setFormData(prev => ({ ...prev, dns: updatedDns }));
                      }}
                  />
                  <button
                      type="button"
                      className="remove-dns-btn"
                      onClick={() => removeDnsField(idx)}
                      aria-label={`Remove DNS ${idx + 1}`}
                  >
                    <XIcon size={16} />
                  </button>
                </div>
            ))}
            <button type="button" className="dns-btn" onClick={addDnsField}>+ Add DNS</button>
        </div>
      </div>

      <button type="submit" className="submit-btn">Save Profile</button>
    </form>
  );
}
