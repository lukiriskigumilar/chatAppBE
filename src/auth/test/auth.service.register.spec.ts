/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../users/users.service'; // pastikan path sesuai
import { JwtService } from '@nestjs/jwt';

// tipe user sesuai service
type User = {
  id: string;
  email: string;
  username: string;
  password: string;
};

// Mock UserService
const mockUserService = {
  findByEmail: jest.fn<Promise<User | null>, [string]>(),
  findByUsername: jest.fn<Promise<User | null>, [string]>(),
  create: jest.fn<Promise<User>, [Partial<User>]>(),
};

// Mock JwtService (tidak digunakan di register, tapi harus ada di provider)
const mockJwtService = {
  sign: jest.fn(),
};

describe('REGISTER USER', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    const dto: RegisterDto = {
      email: 'test@mail.com',
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
    };

    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByUsername.mockResolvedValue(null);
    mockUserService.create.mockImplementation(async (user) => ({
      id: 'Usr12345',
      email: user.email!,
      username: user.username!,
      password: user.password!,
    }));

    const result = await service.register(dto);

    expect(result).toEqual({
      email: dto.email,
      username: dto.username,
    });

    expect(mockUserService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUserService.findByUsername).toHaveBeenCalledWith(dto.username);
    expect(mockUserService.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if email exists', async () => {
    mockUserService.findByEmail.mockResolvedValue({
      id: 'Usr12345',
      email: 'exist@mail.com',
      username: 'existuser',
      password: 'hashed',
    });

    const dto: RegisterDto = {
      email: 'exist@mail.com',
      username: 'newuser',
      password: '123456',
      confirmPassword: '123456',
    };

    await expect(service.register(dto)).rejects.toThrow(ConflictException);
    expect(mockUserService.findByEmail).toHaveBeenCalledWith(dto.email);
  });

  it('should throw ConflictException if username exists', async () => {
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByUsername.mockResolvedValue({
      id: 'Usr54321',
      email: 'new@mail.com',
      username: 'existuser',
      password: 'hashed',
    });

    const dto: RegisterDto = {
      email: 'new@mail.com',
      username: 'existuser',
      password: '123456',
      confirmPassword: '123456',
    };

    await expect(service.register(dto)).rejects.toThrow(ConflictException);
    expect(mockUserService.findByUsername).toHaveBeenCalledWith(dto.username);
  });

  it('should hash the password before saving', async () => {
    const dto: RegisterDto = {
      email: 'hash@mail.com',
      username: 'hashuser',
      password: 'mypassword',
      confirmPassword: 'mypassword',
    };

    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByUsername.mockResolvedValue(null);
    mockUserService.create.mockImplementation(async (user) => ({
      id: 'UsrMockedId',
      email: user.email!,
      username: user.username!,
      password: user.password!,
    }));

    await service.register(dto);

    const hashedPassword = mockUserService.create.mock.calls[0][0].password!;
    const isMatch = await bcrypt.compare(dto.password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
