// TODO: Define a City class with name and id properties

import fs from 'fs/promises';

class City {
  name: string;
  id: string;
  

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
 
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile('searchHistory.json', 'utf8');
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile('searchHistory.json', JSON.stringify(cities, null, 2));
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    const cities = await this.read();
    return JSON.parse(cities);
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities = await this.getCities();
    cities.push(new City(city, (cities.length + 1).toString()));
    await this.write(cities);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities = await this.getCities();
    const newCities = cities.filter((city: City) => city.id !== id);
    await this.write(newCities);
  }
}

export default new HistoryService();