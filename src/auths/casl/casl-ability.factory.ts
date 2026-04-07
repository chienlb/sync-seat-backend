import { AbilityBuilder, createMongoAbility, ExtractSubjectType, MongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

// Định nghĩa các tài nguyên (Subjects) trong hệ thống
export type Subjects = 'Movie' | 'Ticket' | 'all';
export type AppAbility = MongoAbility<[string, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // 1. Nếu là Admin: Quyền tối thượng
    if (user.role.name === 'ADMIN') {
      can('manage', 'all'); 
    } else {
      // 2. Đọc quyền từ Permissions & Policies trong DB
      user.role.permissions.forEach((p) => {
        // Áp dụng PBAC: Check điều kiện từ Policy
        // Ví dụ: Nhân viên chỉ được sửa phim ở rạp mình quản lý
        can(p.action, p.resource, user.managedTheaterId ? { theaterId: user.managedTheaterId } : {});
      });
    }

    return build({
      detectSubjectType: (item: any) =>
        (item?.__caslSubjectType__ || item?.constructor?.name) as ExtractSubjectType<Subjects>,
    });
  }
}