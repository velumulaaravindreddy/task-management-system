import 'reflect-metadata';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    console.error('Error bootstrapping application:', err);
    // Display error to user
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial; color: red;">
        <h1>Application Error</h1>
        <p>Failed to start the application. Please check the console for details.</p>
        <pre>${err.message || err}</pre>
      </div>
    `;
  });

