import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spinner } from './components/spinner/spinner';
import { Alert } from './components/alert/alert';
import { Button } from './components/button/button';
import { Modal } from './components/modal/modal';

@NgModule({
  declarations: [
    Spinner,
    Alert,
    Button,
    Modal,
  ],
  imports: [CommonModule],
  exports: [
    Spinner,
    Alert,
    Button,
    Modal,
  ],
})
export class SharedModule {}
