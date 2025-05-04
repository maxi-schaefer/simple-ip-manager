export const subnetMaskToCIDR = (subnetMask: string): number => {
    const parts = subnetMask.split('.').map(Number);
    let cidr = 0;
    for (const part of parts) {
        if (part === 255) {
            cidr += 8;
        } else if (part === 0) {
            break;
        } else {
            let binary = part.toString(2).padStart(8, '0');
            cidr += binary.indexOf('0');
            break;
        }
    }
    return cidr;
}