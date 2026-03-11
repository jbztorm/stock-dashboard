import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendStockAlert } from '@/lib/feishu';

// 获取预警列表
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*, stocks(*)')
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

// 添加预警
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stock_id, alert_type, threshold } = body;

    if (!stock_id || !alert_type || !threshold) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert([{ stock_id, alert_type, threshold }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除预警
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing alert id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('alerts')
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
