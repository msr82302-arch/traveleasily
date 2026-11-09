/**
 * Easy Travels Platform Security & Context Protection
 * Prevents casual source inspection / context menu scraping while fully preserving
 * input field editing, copy/paste inside form fields, and keyboard accessibility.
 */

export function setupSecurityGuards() {
  if (typeof window === 'undefined') return () => {};

  // 1. Right-click context menu protection (exempt form fields and text areas)
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Allow native context menu inside editable form fields so users can paste passport numbers, emails, etc.
    const isInputField =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('input') !== null ||
      target.closest('textarea') !== null;

    if (!isInputField) {
      e.preventDefault();
      showProtectionNotice('Right-click context menu is restricted on Easy Travels secure document clearance surfaces.');
    }
  };

  // 2. DevTools keyboard shortcuts deterrence
  const handleKeyDown = (e: KeyboardEvent) => {
    const isF12 = e.key === 'F12';
    const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i');
    const isCtrlShiftJ = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j');
    const isCtrlShiftC = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c');
    const isCtrlU = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');

    if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU) {
      e.preventDefault();
      showProtectionNotice('Developer inspection shortcuts are disabled to safeguard passenger biometric and passport data.');
    }
  };

  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  return () => {
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}

let activeNoticeTimeout: any = null;

function showProtectionNotice(message: string) {
  let toast = document.getElementById('et-security-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'et-security-toast';
    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/95 text-white text-xs font-medium shadow-2xl border border-slate-700/60 flex items-center gap-2 pointer-events-none transition-all duration-300';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
    <span>${message}</span>
  `;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';

  if (activeNoticeTimeout) clearTimeout(activeNoticeTimeout);
  activeNoticeTimeout = setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
    }
  }, 3200);
}
