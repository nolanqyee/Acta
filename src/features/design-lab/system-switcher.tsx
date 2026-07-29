/**
 * @fileoverview Lab-only instrumentation for `/lab/design`: a segmented row that
 * picks which named design system (see `systems.ts`) the workbench renders. Kept
 * visually opaque and constant across every system it's testing — see
 * `system-switcher.module.css`.
 */

"use client";

import { DESIGN_SYSTEMS, type DesignSystem } from "./systems";
import styles from "./system-switcher.module.css";

interface SystemSwitcherProps {
  active: DesignSystem;
  onChange: (system: DesignSystem) => void;
}

/**
 * Renders one button per known design system, highlighting whichever is active.
 *
 * @param props.active - The system currently applied to the workbench shell.
 * @param props.onChange - Called with the newly picked system on click.
 * @returns The bottom-left segmented control.
 */
export function SystemSwitcher({ active, onChange }: SystemSwitcherProps) {
  return (
    <div className={styles.switcher}>
      <div className={styles.row} role="group" aria-label="Design system">
        {DESIGN_SYSTEMS.map((system) => (
          <button
            key={system}
            type="button"
            className={
              system === active
                ? `${styles.option} ${styles.optionActive}`
                : styles.option
            }
            aria-pressed={system === active}
            onClick={() => onChange(system)}
          >
            {system}
          </button>
        ))}
      </div>
    </div>
  );
}
