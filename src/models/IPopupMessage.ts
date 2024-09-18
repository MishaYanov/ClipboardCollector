import type { PopupToBackGroundMessageType } from "./PopupToBackGroundMessageTypes";

export interface IPopupMessage {
    type: PopupToBackGroundMessageType;
    key?: string;
    value?: any;
    payload?: any;
}
