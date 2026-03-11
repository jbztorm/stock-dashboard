import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取自选股列表
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 添加自选股
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, market, exchange, currency } = body;

    if (!code || !name || !market) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('stocks')
      .insert([{ code, name, market, exchange, currency }])
      .select()
      .single();

    if (error) {
      // 股票已存在
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Stock already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除自选股
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing stock id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
