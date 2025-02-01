import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router';
import ThemeSwitchButton from '../../components/theme-switch-button';
import { Button } from '../../components/ui/button';

export default function DrawPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="w-full">
            <BreadcrumbList className="flex flex-row items-center justify-between">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  <p className="text-md font-bold text-main-700 dark:text-main-300 mx-4">
                    polygon
                  </p>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem className="flex items-center">
                <Link to="/">
                  <Button variant="ghost" className="mx-2 items-stretch">
                    <LogOut />
                    Back
                  </Button>
                </Link>

                <ThemeSwitchButton />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          Hello world!
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
