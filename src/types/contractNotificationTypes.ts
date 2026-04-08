// Notification types for the contracts system

export type NotificationTypeValue =
	| 'unsigned_contract'
	| 'work_start'
	| 'reserve_deadline'
	| 'status_change';

export interface NotificationType {
	id: number;
	title: string;
	message: string;
	notification_type: NotificationTypeValue;
	object_id: number | null;
	is_read: boolean;
	date_created: string;
}

export interface NotificationPreferenceType {
	id: number;
	notify_unsigned_contract: boolean;
	notify_work_start: boolean;
	notify_reserve_deadline: boolean;
	notify_status_change: boolean;
	unsigned_alert_days: number;
	work_start_alert_days: number;
	date_created: string;
	date_updated: string;
}

export interface NotificationPreferenceFormValues {
	notify_unsigned_contract: boolean;
	notify_work_start: boolean;
	notify_reserve_deadline: boolean;
	notify_status_change: boolean;
	unsigned_alert_days: number;
	work_start_alert_days: number;
	globalError: string;
}
