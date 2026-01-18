import { Header } from "@/components/layout/Header";
import { AdBlock } from "@/components/ads/AdBlock";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AdBlock position="content_top" className="container mx-auto px-4 py-2" />
      <main>{children}</main>
      <AdBlock position="content_bottom" className="container mx-auto px-4 py-2" />
    </>
  );
}
