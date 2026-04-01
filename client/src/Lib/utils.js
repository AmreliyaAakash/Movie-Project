export const isReleased = (dateString) => {
    if (!dateString) return false;
    const releaseDate = new Date(dateString).getTime();
    if (isNaN(releaseDate)) return false;

    // Using current time. 
    // If releaseDate <= now, it's released.
    // If releaseDate > now, it's upcoming.
    return releaseDate <= Date.now();
};

export const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export const formatTime = (timeString) => {
    if (!timeString) return "";

    // Check if it's already in HH:MM format (simple check)
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        return timeString;
    }

    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    return timeString;
};export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
    
    // If the path is an absolute localhost URL (from local development db entries)
    // we replace it with the current API base URL
    if (path.startsWith('http://localhost:5000')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        return path.replace('http://localhost:5000', baseUrl);
    }

    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

