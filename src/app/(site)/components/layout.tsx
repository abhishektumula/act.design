import { Sidebar } from "@/components/site/sidebar";

export default function ComponentsLayout({ children }: LayoutProps<"/components">) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-10 px-6 pt-16">
      <Sidebar />
      <main className="min-w-0 flex-1 py-12">{children}</main>
    </div>
  );
}
