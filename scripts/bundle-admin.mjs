import { bundle } from '@adminjs/bundler';
import { ComponentLoader } from 'adminjs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const componentsDir = join(__dirname, '..', 'src', 'admin', 'components');

const componentLoader = new ComponentLoader();
componentLoader.add('Dashboard', join(componentsDir, 'dashboard'));
componentLoader.add('PhotoPreview', join(componentsDir, 'photo-preview'));

await bundle({
  componentLoader,
  destinationDir: 'dist/admin-assets',
});
