import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ButtonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  #authServise = inject(AuthService);
  user$ = this.#authServise.user$;

  logout() {
    this.#authServise.logout();
  }
}
