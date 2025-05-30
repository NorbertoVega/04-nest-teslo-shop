import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData, SeedProduct } from './data/seed-data';
import { CreateProductDto } from 'src/products/dto/create-product.dto';


@Injectable()
export class SeedService {
  
  constructor(
    private readonly productsService: ProductsService) {}

  runSeed() {
    this.insertNewProducts();
    return `Seed Executed`;
  }

  private async insertNewProducts() {
    this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;
    
    const insertPromises: Promise<CreateProductDto| undefined>[] = [];

    seedProducts.forEach(product => {
      const promiseToInsert: Promise<CreateProductDto| undefined> = this.productsService.create(product); 
      insertPromises.push(promiseToInsert);
    });

    await Promise.all(insertPromises);

    return true;
  }
  
}
