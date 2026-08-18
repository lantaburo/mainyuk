import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const modules = await prisma.module.findMany({
      where: { gradeLevel: { gte: 2 } },
      select: { id: true, title: true, gradeLevel: true }
    });
    
    if (modules.length === 0) {
      return NextResponse.json({ message: 'Tidak ada modul kelas 2 ke atas' });
    }

    const moduleIds = modules.map(m => m.id);
    const result = await prisma.question.deleteMany({
      where: {
        moduleId: { in: moduleIds }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil menghapus ${result.count} soal dari kelas 2 sampai 6.` 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
