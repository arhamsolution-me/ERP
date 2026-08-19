import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    // 1. Fetch transactions for tenant
    const allTransactions = await prisma.posTransaction.findMany({
      where: { tenant_id: session.tenantId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Today's metrics
    const todayTransactions = allTransactions.filter((tx) => tx.created_at >= startOfToday);
    const yesterdayTransactions = allTransactions.filter(
      (tx) => tx.created_at >= startOfYesterday && tx.created_at < startOfToday
    );

    const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.total, 0n);
    const yesterdayRevenue = yesterdayTransactions.reduce((sum, tx) => sum + tx.total, 0n);

    let growthPercent = 0;
    if (yesterdayRevenue > 0n) {
      growthPercent = Number(((todayRevenue - yesterdayRevenue) * 100n) / yesterdayRevenue);
    } else if (todayRevenue > 0n) {
      growthPercent = 100;
    }

    const totalOrdersCount = todayTransactions.length;
    const avgTicketValue = totalOrdersCount > 0 ? Number(todayRevenue / BigInt(totalOrdersCount)) : 0;

    // 2. 7-Day Revenue Trend
    const trendMap: Record<string, bigint> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      trendMap[key] = 0n;
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    allTransactions
      .filter((tx) => tx.created_at >= sevenDaysAgo)
      .forEach((tx) => {
        const key = tx.created_at.toLocaleDateString('en-US', { weekday: 'short' });
        if (trendMap[key] !== undefined) {
          trendMap[key] += tx.total;
        }
      });

    const revenueTrend = Object.entries(trendMap).map(([day, val]) => ({
      day,
      revenue: Number(val),
    }));

    // 3. Payment Method Breakdown
    const paymentMethods = {
      cash: 0,
      card: 0,
      jazzcash: 0,
      easypaisa: 0,
      credit: 0,
    };

    allTransactions.forEach((tx) => {
      const method = tx.payment_method;
      if (paymentMethods[method] !== undefined) {
        paymentMethods[method] += Number(tx.total);
      }
    });

    const paymentBreakdown = [
      { name: 'Cash', value: paymentMethods.cash, fill: '#0284c7' },
      { name: 'Card', value: paymentMethods.card, fill: '#6366f1' },
      { name: 'JazzCash', value: paymentMethods.jazzcash, fill: '#e11d48' },
      { name: 'Easypaisa', value: paymentMethods.easypaisa, fill: '#10b981' },
      { name: 'Credit', value: paymentMethods.credit, fill: '#f59e0b' },
    ].filter((p) => p.value > 0);

    // 4. Top Selling Products
    const productStats: Record<string, { name: string; sku: string; quantity: number; revenue: number }> = {};
    allTransactions.forEach((tx) => {
      tx.items.forEach((it) => {
        const name = it.variant?.product?.name || 'Product';
        const sku = it.variant?.product?.sku || 'SKU';
        if (!productStats[sku]) {
          productStats[sku] = { name, sku, quantity: 0, revenue: 0 };
        }
        productStats[sku].quantity += it.quantity;
        productStats[sku].revenue += Number(it.line_total);
      });
    });

    const topSelling = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 5. Total customers count
    const totalCustomers = await prisma.customer.count({
      where: { tenant_id: session.tenantId },
    });

    // 6. Active shift count
    const activeShift = await prisma.shift.findFirst({
      where: { tenant_id: session.tenantId, status: 'open' },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        todayRevenue: Number(todayRevenue),
        yesterdayRevenue: Number(yesterdayRevenue),
        growthPercent,
        totalOrdersCount,
        avgTicketValue,
        totalCustomers,
        hasActiveShift: Boolean(activeShift),
        activeShiftOpening: activeShift ? Number(activeShift.opening_cash) : 0,
      },
      revenueTrend,
      paymentBreakdown: paymentBreakdown.length > 0 ? paymentBreakdown : [{ name: 'Cash', value: 100, fill: '#0284c7' }],
      topSelling,
    });
  } catch (error: any) {
    console.error('[Sales Dashboard API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
