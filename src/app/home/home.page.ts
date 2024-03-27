import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fingerPrint } from 'ionicons/icons';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem, IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { VaultService, VaultServiceState } from '../vault.service';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonItemDivider, IonHeader, IonToolbar, IonTitle, IonContent,IonFab, IonIcon,
    IonFabButton, IonList, IonInput, FormsModule, ReactiveFormsModule, IonButton, IonLabel, IonItem,IonListHeader, IonRadioGroup, IonRadio
  ],
})
export class HomePage {
  public state: VaultServiceState;

  constructor(private vaultService: VaultService) {
    addIcons({fingerPrint})
    this.state = vaultService.state;
  }

  async setSession(data?: string) {
    await this.vaultService.setSession(data);
  }

  async restoreSession() {
    await this.vaultService.restoreSession();
  }
  async lockVault() {
    await this.vaultService.lockVault();
  }

  async unlockVault() {
    await this.vaultService.unlockVault();
  }

  async setLockType() {
    await this.vaultService.setLockType();
  }

  async clearVault() {
    await this.vaultService.clearVault();
  }

  async biometricPrompt() {
    await this.vaultService.showBiometricPrompt();
  }

}
