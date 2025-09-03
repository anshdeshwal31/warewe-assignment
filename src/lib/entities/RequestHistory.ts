import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  url!: string;

  @Enum(() => HttpMethod)
  method!: HttpMethod;

  @Property({ type: 'text', nullable: true })
  headers?: string; // JSON string

  @Property({ type: 'text', nullable: true })
  body?: string;

  @Property({ type: 'text', nullable: true })
  response?: string; // JSON string

  @Property({ nullable: true })
  statusCode?: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ nullable: true })
  responseTime?: number; // in milliseconds

  @Property({ nullable: true })
  name?: string; // User-defined name for the request
}
