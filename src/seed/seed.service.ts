import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return `Seed Executed`;
  }

  private async deleteTables() {
    this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    //this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises: Promise<CreateProductDto | undefined>[] = [];

    seedProducts.forEach(product => {
      const promiseToInsert: Promise<CreateProductDto | undefined> = this.productsService.create(product, user);
      insertPromises.push(promiseToInsert);
    });

    await Promise.all(insertPromises);

    return true;
  }

}
