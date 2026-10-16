import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // O el nombre exacto de tu clase principal

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));