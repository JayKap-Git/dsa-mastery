// Entry point for every page. Order matters: migrate old data before anything reads the store.
import { migrateV1 } from '../lib/store/migrate';
import { initAccount } from './ui/account';
import { initChrome } from './ui/chrome';
import { initCses } from './ui/cses';
import { initMe } from './ui/me';
import { initNotes } from './ui/notes';
import { initProgress } from './ui/progress';

migrateV1();
initChrome();
initProgress();
initNotes();
initCses();
initMe();
initAccount();
