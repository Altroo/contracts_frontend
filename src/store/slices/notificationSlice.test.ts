import reducer, { incrementUnreadCount, setLatestNotification, setUnreadCount } from './notificationSlice';
import type { NotificationType } from '@/types/contractNotificationTypes';

describe('notification slice', () => {
  const sampleNotification: NotificationType = {
    id: 1,
    title: 'Contrat non signé',
    message: 'Le contrat 10 est toujours non signé.',
    notification_type: 'unsigned_contract',
    object_id: 10,
    is_read: false,
    date_created: '2026-04-01T10:00:00Z',
  };

  it('returns the initial state when given undefined state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({
      unreadCount: 0,
      latestNotification: null,
    });
  });

  it('setUnreadCount sets the unread count', () => {
    expect(reducer(undefined, setUnreadCount(5)).unreadCount).toBe(5);
  });

  it('incrementUnreadCount increments the count by one', () => {
    const state = { unreadCount: 2, latestNotification: null };
    expect(reducer(state, incrementUnreadCount()).unreadCount).toBe(3);
  });

  it('setLatestNotification stores the latest notification', () => {
    expect(reducer(undefined, setLatestNotification(sampleNotification)).latestNotification).toEqual(sampleNotification);
  });

  it('setLatestNotification overwrites the previous notification', () => {
    const next = reducer(
      { unreadCount: 1, latestNotification: sampleNotification },
      setLatestNotification({ ...sampleNotification, id: 2, notification_type: 'work_start' }),
    );

    expect(next.latestNotification?.id).toBe(2);
    expect(next.latestNotification?.notification_type).toBe('work_start');
  });
});