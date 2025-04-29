import { TabManager } from './TabManager.js';
import { QualityManager } from './QualityManager.js';
import { VisibilityListener } from './VisibilityListener.js';

console.log('YT Stream Saver - Content script démarré');

// Initialisation
const tabManager = new TabManager();
const qualityManager = new QualityManager(tabManager);
const visibilityListener = new VisibilityListener(tabManager, qualityManager);

tabManager.init();
qualityManager.init();
visibilityListener.init();
