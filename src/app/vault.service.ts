import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BrowserVault, Device, DeviceSecurityType, IdentityVaultConfig, Vault, VaultType } from '@ionic-enterprise/identity-vault';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivangular',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';
type VaultLockTypeState = "NoLocking" | "Biometrics" | "Both" |  "SystemPasscode";

export interface VaultServiceState {
  session?: string;
  isLocked: boolean;
  lockType: VaultLockTypeState;
  canUseBiometrics: boolean;
  canUsePasscode: boolean;
  isEmpty: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class VaultService {
  public state: VaultServiceState = {
    isLocked: false,
    lockType: 'NoLocking',
    canUseBiometrics: false,
    canUsePasscode: false,
    isEmpty: true
  };

  vault: Vault | BrowserVault;

  constructor(private ngZone: NgZone) {
    this.vault = Capacitor.getPlatform() === 'web' ? new BrowserVault() : new Vault();
  }

  async init(): Promise<void> {
    await this.vault.initialize(config);

    this.vault.onLock(() => {
      this.ngZone.run(() => {
        this.state.isLocked = true;
        this.state.session = undefined;
      });
    });

    this.vault.onUnlock(() => {
      this.ngZone.run(() => {
        this.state.isLocked = false;
      });
    });

    //Setting initial state
    this.state.canUseBiometrics = Capacitor.getPlatform() === "web" ? false : await Device.isBiometricsEnabled();
    this.state.canUsePasscode = Capacitor.getPlatform() === "web" ? false : await Device.isSystemPasscodeSet();
    this.state.isLocked = await this.vault.isLocked();
    this.state.isEmpty = await this.vault.isEmpty();
    this.ngZone.run(() => {
      console.log('Vault initialized', this.vault.config);
      this.state.lockType = this.lockTypeStateFromConfig(this.vault.config);
    });
  }
  private lockTypeStateFromConfig(vaultConfig?: IdentityVaultConfig): VaultLockTypeState {
    switch (vaultConfig?.deviceSecurityType) {
      case DeviceSecurityType.Biometrics:
        return 'Biometrics';
      case DeviceSecurityType.Both:
        return 'Both';
      case DeviceSecurityType.SystemPasscode:
        return 'SystemPasscode';
      default:
        return 'NoLocking';
    }
  }
  async setLockType() {
    let type: VaultType;
    let deviceSecurityType: DeviceSecurityType;

    switch (this.state.lockType) {
      case 'Biometrics':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Biometrics;
        break;

      case 'Both':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Both;
        break;

      case 'SystemPasscode':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      default:
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.None;
    }
    await this.vault.updateConfig({ ...this.vault.config!, type, deviceSecurityType });
  }

  async setSession(value?: string): Promise<void> {
    this.state.session = value;
    await this.vault.setValue(key, value);
  }

  async restoreSession() {
    const value = await this.vault.getValue(key);
    this.state.session = value;
  }
  async lockVault() {
    await this.vault.lock();
  }

  async unlockVault() {
    await this.vault.unlock();
  }
  async clearVault() {
    await this.vault.clear();
    this.state.lockType = "NoLocking";
    this.state.session = undefined;
    this.state.isEmpty = await this.vault.isEmpty();
  }
}
