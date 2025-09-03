import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosResponse } from 'axios';
import { getORM } from '@/lib/db';
import { RequestHistory, HttpMethod } from '@/lib/entities/RequestHistory';
import { HttpRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: HttpRequest = await request.json();
    const { url, method, headers = {}, body: requestBody, name } = body;

    if (!url || !method) {
      return NextResponse.json(
        { error: 'URL and method are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    let response: AxiosResponse;
    
    try {
      response = await axios({
        url,
        method: method.toLowerCase() as any,
        headers,
        data: requestBody,
        timeout: 30000, // 30 seconds timeout
        validateStatus: () => true, // Accept all status codes
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Save failed request to history
      const orm = await getORM();
      const em = orm.em.fork();
      
      const historyEntry = new RequestHistory();
      historyEntry.url = url;
      historyEntry.method = method as HttpMethod;
      historyEntry.headers = JSON.stringify(headers);
      historyEntry.body = requestBody;
      historyEntry.response = JSON.stringify({ error: error.message });
      historyEntry.statusCode = error.response?.status || 0;
      historyEntry.responseTime = responseTime;
      historyEntry.name = name;
      
      await em.persistAndFlush(historyEntry);
      
      return NextResponse.json(
        {
          error: error.message,
          status: error.response?.status || 0,
          statusText: error.response?.statusText || 'Network Error',
          headers: error.response?.headers || {},
          data: error.response?.data || null,
          responseTime,
        },
        { status: 500 }
      );
    }

    const responseTime = Date.now() - startTime;
    
    // Save successful request to history
    const orm = await getORM();
    const em = orm.em.fork();
    
    const historyEntry = new RequestHistory();
    historyEntry.url = url;
    historyEntry.method = method as HttpMethod;
    historyEntry.headers = JSON.stringify(headers);
    historyEntry.body = requestBody;
    historyEntry.response = JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
    historyEntry.statusCode = response.status;
    historyEntry.responseTime = responseTime;
    historyEntry.name = name;
    
    await em.persistAndFlush(historyEntry);

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      responseTime,
    });
  } catch (error: any) {
    console.error('Request execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
