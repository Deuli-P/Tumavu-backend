import { Injectable } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      companiesTotal,
      companiesThisMonth,
      announcementsTotal,
      activeUsersThisMonth,
      newUsersThisMonth,
      usersCount,
      managersCount,
      passagesByMonthRaw,
      recentCompanies,
    ] = await Promise.all([
      this.db.company.count({ where: { deleted: false } }),

      this.db.company.count({ where: { deleted: false, createdAt: { gte: startOfMonth } } }),

      this.db.announcement.count({ where: { deleted: false } }),

      this.db.auth.count({
        where: {
          deleted: false,
          lastSignInAt: { gte: startOfMonth },
          user: { role: { type: { not: RoleType.ADMIN } } },
        },
      }),

      this.db.auth.count({
        where: {
          deleted: false,
          createdAt: { gte: startOfMonth },
          user: { role: { type: { not: RoleType.ADMIN } } },
        },
      }),

      this.db.user.count({ where: { deleted: false, role: { type: RoleType.USER } } }),

      this.db.user.count({ where: { deleted: false, role: { type: RoleType.MANAGER } } }),

      this.db.$queryRaw<{ month: string; count: number }[]>`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          CAST(COUNT(*) AS INTEGER)      AS count
        FROM passages
        WHERE created_at >= (CURRENT_DATE - INTERVAL '11 months')
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month ASC
      `,

      this.db.company.findMany({
        where: { deleted: false },
        select: {
          id: true,
          name: true,
          createdAt: true,
          address: { select: { locality: true, country: { select: { name: true } } } },
          _count: { select: { announcements: { where: { deleted: false } }, passages: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Fill missing months with 0
    const passagesByMonth = this.fillMonths(passagesByMonthRaw, 12);

    return {
      stats: {
        companiesTotal,
        companiesThisMonth,
        announcementsTotal,
        activeUsersThisMonth,
        newUsersThisMonth,
      },
      passagesByMonth,
      roleDistribution: [
        { label: 'Utilisateurs', count: usersCount },
        { label: 'Owners', count: managersCount },
      ],
      recentCompanies,
    };
  }

  private fillMonths(
    rows: { month: string; count: number }[],
    n: number,
  ): { month: string; count: number }[] {
    const map = new Map(rows.map((r) => [r.month, r.count]));
    const result: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ month: key, count: map.get(key) ?? 0 });
    }
    return result;
  }
}
