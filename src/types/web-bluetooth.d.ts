
// Type definitions for Web Bluetooth API
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connect: () => Promise<BluetoothRemoteGATTServer>;
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
}
