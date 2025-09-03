import { Migration } from '@mikro-orm/migrations';

export class Migration20250903112529 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`request_history\` (\`id\` integer not null primary key autoincrement, \`url\` text not null, \`method\` text check (\`method\` in ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')) not null, \`headers\` text null, \`body\` text null, \`response\` text null, \`status_code\` integer null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`response_time\` integer null, \`name\` text null);`);
  }

}
