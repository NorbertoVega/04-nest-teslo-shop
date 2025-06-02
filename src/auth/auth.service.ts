import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { CreateUserDTO, LoginUserDTO } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');


  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService) { }

  async create(createUserDTO: CreateUserDTO) {
    try {
      const { password, ...userData } = createUserDTO;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    }
    catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async login(loginUserDTO: LoginUserDTO) {
    const { password, email } = loginUserDTO;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (pass)');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private removeResponseFields(user: User) {
    const { password, isActive, roles, ...responseUser } = user;
    return responseUser;
  }

  private handleDbExceptions(error: any): never {
    console.log('handleDbExceptions=', error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error. Please check server logs');
  }

}
