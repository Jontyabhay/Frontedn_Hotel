import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly categories = [
    { icon: '🍕', name: 'Pizza' }, { icon: '🍔', name: 'Burgers' },
    { icon: '🍜', name: 'Asian' }, { icon: '🥗', name: 'Healthy' },
    { icon: '☕', name: 'Coffee' }, { icon: '🍰', name: 'Dessert' },
  ];
  protected readonly restaurants = [
    { image: '🍕', name: 'Napoli Kitchen', tags: 'Italian · Pizza', time: '20–30 min', rating: '4.8', color: 'coral' },
    { image: '🍔', name: 'Good Burger Co.', tags: 'Burgers · American', time: '25–35 min', rating: '4.7', color: 'gold' },
    { image: '🍜', name: 'Wok & Roll', tags: 'Asian · Noodles', time: '30–40 min', rating: '4.9', color: 'teal' },
  ];
}
