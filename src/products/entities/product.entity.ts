import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'ca061d1e-7ed7-442e-b67b-50eaee26ecc5',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Tesla',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product Price',
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'Example of description of the product...',
        description: 'Product description',
        default: null
    })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({
        example: 't_shirt_tesla',
        description: 'Product Slug - for SEO',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product Sizes'
    })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product Gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shirt', 'women'],
        description: 'Product tags'
    })
    @Column('text', { array: true, default: [] })
    tags: string[];

    @ApiProperty({
        example: ["httts://image1.jgpg", "httts://image2.jgpg"],
        description: 'Product images'
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ApiProperty({
        example: {
            "id": "5512808f-c37f-439c-a38c-e8a8a56b5704",
            "email": "test1@google.com",
            "fullName": "Test One",
            "isActive": true,
            "roles": [
                "admin"
            ]
        },
        description: 'User that created the product'
    })
    @ManyToOne(
        () => User,
        (user) => user.products,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

}
