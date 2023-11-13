export const BACKGROUND_IMAGE_ID = "background-image";
export const TEXT_ID = "default-copy";
export const DB_NAME = "unsplash-new-tab";
export const DB_TABLE = "images";
export const MAX_CACHED_IMAGES = 6;
export const NUMBER_OF_PHOTOS_TO_FETCH = 2;

// 2560x1920 is the minimum resolution allowed on Unsplash.
// 4096x2160 == 4k resolution
export const IMAGE_RESOLUTION = `${screen.width}x${screen.height - 90}`;
export const DEFAULT_BASE_URL = "https://source.unsplash.com/random";
export const DEFAULT_UNSPASH_URL = `${DEFAULT_BASE_URL}/${IMAGE_RESOLUTION}`;
