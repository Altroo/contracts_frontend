import {WSMaintenanceAction, WSUserAvatarAction, WSReconnectedAction} from "@/store/actions/wsActions";

/*
"message": {
	"pk": object_.pk,
	"avatar": object_.get_absolute_avatar_thumbnail,
}
 */

export interface WSMaintenanceBootstrap {
  maintenance: boolean;
}

export type WSAction = ReturnType<typeof WSUserAvatarAction> | ReturnType<typeof WSMaintenanceAction> | ReturnType<typeof WSReconnectedAction>;

type WSMessage = {
  type: string;
  pk?: number;
  avatar?: string;
  maintenance?: boolean;
};

export type WSEnvelope = {
  message: WSMessage;
};