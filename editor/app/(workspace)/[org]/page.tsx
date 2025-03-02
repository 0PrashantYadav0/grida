"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  OpenInNewWindowIcon,
  PlusIcon,
  ViewGridIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons";
import { CreateNewDocumentButton } from "@/scaffolds/workspace/create-new-document-button";
import { GDocument } from "@/types";
import { ProjectStats } from "@/scaffolds/analytics/stats";
import { PoweredByGridaFooter } from "@/scaffolds/e/form/powered-by-brand-footer";
import { GridCard, RowCard } from "@/components/site/form-card";
import { BoxSelectIcon } from "lucide-react";
import { CreateNewProjectDialog } from "@/scaffolds/workspace/new-project-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/scaffolds/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { editorlink } from "@/lib/forms/url";

export default function DashboardProjectsPage({
  params,
  searchParams,
}: {
  params: {
    org: string;
  };
  searchParams: {
    layout?: "grid" | "list";
  };
}) {
  const layout = searchParams.layout ?? "list";

  const { state } = useWorkspace();
  const { loading, organization, projects, documents } = state;

  return (
    <main className="w-full h-full overflow-y-scroll">
      <div className="container mx-auto">
        <header className="py-10">
          <div>
            <span className="text-2xl font-black">Home</span>
          </div>
        </header>
        {loading ? (
          <></>
        ) : (
          <>
            <section className="py-10">
              <ProjectStats project_ids={projects.map((p) => p.id)} />
            </section>
          </>
        )}
        <section className="w-full flex justify-end gap-2 mt-10">
          <Link href="?layout=grid" replace>
            <ViewGridIcon />
          </Link>
          <Link href="?layout=list" replace>
            <ViewHorizontalIcon />
          </Link>
        </section>
        <hr className="mb-10 mt-5" />
        {loading ? (
          <ProjectsLoading />
        ) : (
          <>
            {projects.length === 0 && (
              <Card>
                <CardContent className="py-16">
                  <CardHeader />
                  <div className="flex flex-col items-center justify-center gap-8">
                    <div className="flex flex-col gap-2 items-center">
                      <BoxSelectIcon className="w-12 h-12 text-muted-foreground" />
                      <h2 className="text-lg text-muted-foreground">
                        No projects yet
                      </h2>
                    </div>
                    <CreateNewProjectDialog org={organization.name}>
                      <Button variant="outline">
                        <PlusIcon className="inline w-4 h-4 me-2" />
                        Create your first project
                      </Button>
                    </CreateNewProjectDialog>
                  </div>
                  <CardFooter />
                </CardContent>
              </Card>
            )}
            {projects.map((p) => {
              const projectdocuments = documents.filter(
                (d) => d.project_id === p.id
              );

              return (
                <div key={p.id} className="mb-40">
                  <header className="sticky top-0 py-5 mb-10 flex justify-between items-center border-b bg-background z-10">
                    <Link href={`/${organization.name}/${p.name}`}>
                      <h2 className="text-2xl font-bold">
                        {p.name}
                        <OpenInNewWindowIcon className="inline align-middle ms-2 w-5 h-5" />
                      </h2>
                    </Link>
                    <CreateNewDocumentButton
                      project_name={p.name}
                      project_id={p.id}
                    >
                      <Button className="gap-1">
                        <PlusIcon />
                        Create New
                        <ChevronDownIcon />
                      </Button>
                    </CreateNewDocumentButton>
                  </header>
                  <DocumentsGrid
                    organization_name={organization.name}
                    project_name={p.name}
                    documents={projectdocuments}
                    layout={layout}
                  />
                </div>
              );
            })}
          </>
        )}
        <footer className="mt-10 mb-5">
          <PoweredByGridaFooter />
        </footer>
      </div>
    </main>
  );
}

function DocumentsGrid({
  documents,
  layout,
  organization_name,
  project_name,
}: {
  organization_name: string;
  project_name: string;
  documents: GDocument[];
  layout: "grid" | "list";
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {documents?.map((doc, i) => (
          <Link
            key={i}
            href={editorlink(".", {
              org: organization_name,
              proj: project_name,
              document_id: doc.id,
            })}
            prefetch={false}
          >
            <GridCard {...doc} />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
      <header className="flex text-sm opacity-80">
        <span className="flex-1">
          Documents
          <span className="ml-2 text-xs opacity-50">{documents.length}</span>
        </span>
        <span className="w-32">Entries</span>
        <span className="w-44">Updated At</span>
      </header>
      {documents?.map((doc, i) => (
        <Link
          key={i}
          href={editorlink(".", {
            org: organization_name,
            proj: project_name,
            document_id: doc.id,
          })}
          prefetch={false}
        >
          <RowCard {...doc} />
        </Link>
      ))}
    </div>
  );
}

function ProjectsLoading() {
  return (
    <div className="w-full grid gap-2">
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
    </div>
  );
}
