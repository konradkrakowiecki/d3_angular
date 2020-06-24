import { Injectable } from '@angular/core';
import { data } from '../assets/data';

export interface Country {
  name: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private DATA = data.Countries;

  constructor() { }

  getData() {
    const countries: Country[] = [];
    for (const C of this.DATA) {
      countries.push({
        name: C.Country,
        value: C.TotalConfirmed
        // abs: Math.abs(C.TotalConfirmed)
      });
    }
    return countries;
  }
}
