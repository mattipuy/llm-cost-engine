import { Routes } from '@angular/router';

export const routes: Routes = [
  // Primary SEO route: /tools/chatbot-simulator?m=10000&ti=500
  {
    path: 'tools/chatbot-simulator',
    loadComponent: () =>
      import('./engines/chatbot-simulator/chatbot-simulator.component').then(
        (m) => m.ChatbotSimulatorComponent,
      ),
    title: 'LLM Cost Engine',
  },
  // Root redirect for convenience
  {
    path: '',
    redirectTo: 'tools/chatbot-simulator',
    pathMatch: 'full',
  },
];
