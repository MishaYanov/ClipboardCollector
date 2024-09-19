import type { ICollection } from "./ICollection";
import type { PopupToBackGroundMessageType } from "./PopupToBackGroundMessageTypes";

export interface IPopupMessage {
    type: PopupToBackGroundMessageType;
    key?: string;
    value?: any;
    payload?: any;
    collections?: ICollection[];
}
