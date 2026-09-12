export function isPlanExpired(expiryDateStr) {
    if (!expiryDateStr) return false;
    
    try {
        let year, month, day;
        // Strip out the time if it's a full ISO string
        let datePart = expiryDateStr.split('T')[0];
        
        if (datePart.includes('/')) {
            const parts = datePart.split('/');
            if (parts[2].length === 4) {
                // DD/MM/YYYY
                day = parts[0];
                month = parts[1];
                year = parts[2];
            } else if (parts[0].length === 4) {
                // YYYY/MM/DD
                year = parts[0];
                month = parts[1];
                day = parts[2];
            } else {
                return false;
            }
        } else if (datePart.includes('-')) {
            const parts = datePart.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                year = parts[0];
                month = parts[1];
                day = parts[2];
            } else {
                // DD-MM-YYYY
                day = parts[0];
                month = parts[1];
                year = parts[2];
            }
        } else {
            console.error('[Auth] Unknown date format:', expiryDateStr);
            return false;
        }

        // Construct standard YYYY-MM-DD
        const standardDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Parse the date as 23:59:59 IST (Indian Standard Time, UTC+5:30)
        const expiryIST = new Date(`${standardDate}T23:59:59+05:30`);
        
        if (isNaN(expiryIST.getTime())) {
            console.error('[Auth] Invalid expiry date format:', expiryDateStr);
            return false;
        }

        const now = new Date();
        const isExpired = now > expiryIST;
        
        console.log(`[Auth] Checking expiry: ${expiryDateStr} -> ${standardDate} (IST: ${expiryIST.toISOString()}). Now: ${now.toISOString()}. Expired? ${isExpired}`);
        return isExpired;
    } catch (e) {
        console.error('[Auth] Error parsing expiry date:', e);
        return false;
    }
}
