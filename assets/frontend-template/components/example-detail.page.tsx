// Next App Router 服务端组件 — A 类公开页，SSR head + SSR 公开内容(无登录)
import type { Metadata } from 'next';
import { fetchDetail } from '@/lib/api'; // 你的接口层(公开内容)
import DetailClient from './Detail.client';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const d = await fetchDetail(params.id);
  const url = `https://m.example.com/detail/${params.id}`;
  return {
    title: `${d.title} - 站点名`,
    description: d.summary,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: d.title, description: d.summary, images: [d.cover] },
    twitter: { card: 'summary_large_image' },
    robots: { index: true },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const d = await fetchDetail(params.id); // SSR 输出可抓内容到 HTML
  return <DetailClient data={d} id={params.id} />;
}
