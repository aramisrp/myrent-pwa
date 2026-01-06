import Dexie from 'dexie';

export const db = new Dexie('MyRentDB');
db.version(5).stores({
    properties: '++id, title, address, status, lat, lng, listing_url, region, area, created_at' // Primary key and indexed props
});
