import { API_BASE_URL } from './apiConfig';

export const storageService = {
    /**
     * Uploads a file to the custom backend
     */
    uploadImage: async (file: File, entityType: 'drivers' | 'tours' | 'documents', entityId: string): Promise<string | null> => {
        try {
            // Validate file type
            if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
                throw new Error('Only image files and PDFs are allowed');
            }

            // Validate file size (e.g., max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File size too large. Max 10MB allowed.');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('entityType', entityType);
            formData.append('entityId', entityId);

            // Construct URL - handle relative or absolute
            const url = API_BASE_URL ? `${API_BASE_URL}/api/upload` : `/api/upload`;

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Return full URL
            if (data.url.startsWith('http')) return data.url;
            
            return API_BASE_URL ? `${API_BASE_URL}${data.url}` : data.url;

        } catch (error: any) {
            console.error('Storage Service Error:', error.message);
            // FALLBACK FOR DEMO / OFFLINE
            console.warn("Using Mock URL fallback for upload.");
            return URL.createObjectURL(file);
        }
    },

    // Wrapper for Drivers
    uploadDriverImage: async (file: File, driverId: string, type: string) => {
        return storageService.uploadImage(file, 'drivers', driverId + '_' + type);
    },

    // Wrapper for Documents
    uploadDocument: async (file: File, driverId: string) => {
        return storageService.uploadImage(file, 'documents', driverId);
    },

    // Wrapper for Tours
    uploadTourImage: async (file: File, tourId: string) => {
        return storageService.uploadImage(file, 'tours', tourId);
    }
};
