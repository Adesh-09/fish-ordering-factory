
// Type definitions for Web Bluetooth API
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connect: () => Promise<BluetoothRemoteGATTServer>;
    connected?: boolean;
  };
  watchAdvertisements: () => Promise<void>;
  unwatchAdvertisements: () => void;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;
  connect: () => Promise<BluetoothRemoteGATTServer>;
  disconnect: () => void;
  getPrimaryService: (service: string | number) => Promise<BluetoothRemoteGATTService>;
  getPrimaryServices: (service?: string | number) => Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTService {
  uuid: string;
  device: BluetoothDevice;
  isPrimary: boolean;
  getCharacteristic: (characteristic: string | number) => Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics: (characteristic?: string | number) => Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTCharacteristic {
  service: BluetoothRemoteGATTService;
  uuid: string;
  properties: {
    broadcast: boolean;
    read: boolean;
    writeWithoutResponse: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
    authenticatedSignedWrites: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
  };
  value?: DataView;
  getDescriptor: (descriptor: string | number) => Promise<BluetoothRemoteGATTDescriptor>;
  getDescriptors: (descriptor?: string | number) => Promise<BluetoothRemoteGATTDescriptor[]>;
  readValue: () => Promise<DataView>;
  writeValue: (value: BufferSource) => Promise<void>;
  startNotifications: () => Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications: () => Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTDescriptor {
  characteristic: BluetoothRemoteGATTCharacteristic;
  uuid: string;
  value?: DataView;
  readValue: () => Promise<DataView>;
  writeValue: (value: BufferSource) => Promise<void>;
}

// Add Web Bluetooth API to Navigator interface
interface Navigator {
  bluetooth: {
    getAvailability: () => Promise<boolean>;
    requestDevice: (options: {
      filters?: Array<{
        services?: string[] | number[];
        name?: string;
        namePrefix?: string;
        manufacturerId?: number;
        serviceDataUUID?: string;
      }>;
      optionalServices?: string[] | number[];
      acceptAllDevices?: boolean;
    }) => Promise<BluetoothDevice>;
    referringDevice: BluetoothDevice | null;
    getDevices: () => Promise<BluetoothDevice[]>;
  };
  usb: {
    getDevices: () => Promise<USBDevice[]>;
    requestDevice: (options: { filters: Array<USBDeviceFilter> }) => Promise<USBDevice>;
  }
}

// WebUSB API types
interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDevice {
  usbVersionMajor: number;
  usbVersionMinor: number;
  usbVersionSubminor: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  vendorId: number;
  productId: number;
  deviceVersionMajor: number;
  deviceVersionMinor: number;
  deviceVersionSubminor: number;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  configuration?: USBConfiguration;
  configurations: USBConfiguration[];
  opened: boolean;
  
  open: () => Promise<void>;
  close: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  releaseInterface: (interfaceNumber: number) => Promise<void>;
  selectAlternateInterface: (interfaceNumber: number, alternateSetting: number) => Promise<void>;
  controlTransferIn: (setup: USBControlTransferParameters, length: number) => Promise<USBInTransferResult>;
  controlTransferOut: (setup: USBControlTransferParameters, data?: BufferSource) => Promise<USBOutTransferResult>;
  transferIn: (endpointNumber: number, length: number) => Promise<USBInTransferResult>;
  transferOut: (endpointNumber: number, data: BufferSource) => Promise<USBOutTransferResult>;
  clearHalt: (direction: "in" | "out", endpointNumber: number) => Promise<void>;
  reset: () => Promise<void>;
}

interface USBConfiguration {
  configurationValue: number;
  configurationName?: string;
  interfaces: USBInterface[];
}

interface USBInterface {
  interfaceNumber: number;
  alternate?: USBAlternateInterface;
  alternates: USBAlternateInterface[];
  claimed: boolean;
}

interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  interfaceName?: string;
  endpoints: USBEndpoint[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: "in" | "out";
  type: "bulk" | "interrupt" | "isochronous" | "control";
  packetSize: number;
}

interface USBControlTransferParameters {
  requestType: "standard" | "class" | "vendor";
  recipient: "device" | "interface" | "endpoint" | "other";
  request: number;
  value: number;
  index: number;
}

interface USBInTransferResult {
  data?: DataView;
  status: "ok" | "stall" | "babble";
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: "ok" | "stall";
}
