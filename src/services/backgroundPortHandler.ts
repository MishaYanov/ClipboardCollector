import type { PortName } from "../models/PortName";

class PortService{
    public static instance: PortService;
    private port: chrome.runtime.Port;

    constructor(portNamae: PortName){
        this.port = chrome.runtime.connect({name: portNamae});

        this.port.onMessage.addListener((message) => {
            console.log('message received:', message);
        });
    }

    public static getInstance(portName: PortName): PortService{
        if(!PortService.instance){
            PortService.instance = new PortService(portName);
        }
        return PortService.instance;
    }

    public sendMessage(message: any){
        this.port.postMessage(message);
    }

    public onMessage(callback: (message: any) => void){
        this.port.onMessage.addListener(callback);
    }

    public close(){
        this.port.disconnect();
    }
}

export default PortService;