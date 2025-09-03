import { NextRequest, NextResponse } from 'next/server';
import { getORM } from '@/lib/db';
import { RequestHistory } from '@/lib/entities/RequestHistory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const method = searchParams.get('method') || '';

    const orm = await getORM();
    const em = orm.em.fork();

    // Build query conditions
    const where: any = {};
    
    if (search) {
      where.$or = [
        { url: { $like: `%${search}%` } },
        { name: { $like: `%${search}%` } },
      ];
    }
    
    if (method) {
      where.method = method;
    }

    // Get total count for pagination
    const total = await em.count(RequestHistory, where);

    // Get paginated results
    const history = await em.find(
      RequestHistory,
      where,
      {
        orderBy: { createdAt: 'desc' },
        limit,
        offset: (page - 1) * limit,
      }
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: history.map(item => ({
        id: item.id,
        url: item.url,
        method: item.method,
        headers: item.headers ? JSON.parse(item.headers) : {},
        body: item.body,
        response: item.response ? JSON.parse(item.response) : null,
        statusCode: item.statusCode,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        responseTime: item.responseTime,
        name: item.name,
      })),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const orm = await getORM();
    const em = orm.em.fork();

    const historyItem = await em.findOne(RequestHistory, { id: parseInt(id) });
    
    if (!historyItem) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      );
    }

    await em.removeAndFlush(historyItem);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('History delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history item', details: error.message },
      { status: 500 }
    );
  }
}
