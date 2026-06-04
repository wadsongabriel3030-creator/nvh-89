export const MEMBER_PROGRESS_EVENT = 'member-progress-updated';

export function notifyMemberProgressUpdated() {
  window.dispatchEvent(new CustomEvent(MEMBER_PROGRESS_EVENT));
}
