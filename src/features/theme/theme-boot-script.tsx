/**
 * @fileoverview Blocking boot script that applies the stored theme before first
 * paint. Without it, a user who chose dark gets a frame of warm-paper light while
 * React hydrates — which on a full-bleed canvas app is a very visible flash.
 *
 * It is intentionally tiny and dependency-free: read one localStorage key, set one
 * attribute. Absent or invalid values leave the attribute off, which is how the
 * token file expresses "follow the OS".
 */

import { THEME_STORAGE_KEY } from "./theme-storage";

const BOOT_SCRIPT = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(m==="light"||m==="dark"){document.documentElement.setAttribute("data-mode",m);}}catch(e){}})();`;

/**
 * Renders the theme boot script for the document head.
 *
 * @returns An inline `<script>` element that runs before hydration.
 */
export function ThemeBootScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />;
}
