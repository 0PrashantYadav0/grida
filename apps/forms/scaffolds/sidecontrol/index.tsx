"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  SidebarMenuSectionContent,
  SidebarRoot,
  SidebarSection,
  SidebarSectionHeaderItem,
  SidebarSectionHeaderLabel,
} from "@/components/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ag } from "@/components/design/ag";
import { fonts } from "@/theme/font-family";
import { useEditorState } from "../editor";
import { FormStyleSheetV1Schema } from "@/types";
import * as _variants from "@/theme/palettes";
import { PaletteColorChip } from "@/components/design/palette-color-chip";
import { sections } from "@/theme/section";
import { Button } from "@/components/ui/button";
import { OpenInNewWindowIcon, Pencil2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useMonacoTheme } from "@/components/monaco";
import { customcss_starter_template } from "@/theme/customcss/k";
import { cn } from "@/utils";

const { default: _, ...variants } = _variants;

export function SideControl({ mode }: { mode: "blocks" }) {
  return (
    <SidebarRoot side="right">
      <div className="h-5" />
      {mode === "blocks" && <ModeBlocks />}
    </SidebarRoot>
  );
}

function ModeBlocks() {
  return (
    <>
      <SidebarSection className="border-b pb-4">
        <SidebarSectionHeaderItem>
          <SidebarSectionHeaderLabel>Type</SidebarSectionHeaderLabel>
        </SidebarSectionHeaderItem>
        <FontFamily />
      </SidebarSection>
      <SidebarSection className="border-b pb-4">
        <SidebarSectionHeaderItem>
          <SidebarSectionHeaderLabel>Palette</SidebarSectionHeaderLabel>
        </SidebarSectionHeaderItem>
        <SidebarMenuSectionContent>
          <Palette />
        </SidebarMenuSectionContent>
      </SidebarSection>
      <SidebarSection className="border-b pb-4">
        <SidebarSectionHeaderItem>
          <SidebarSectionHeaderLabel>Background</SidebarSectionHeaderLabel>
        </SidebarSectionHeaderItem>
        <SidebarMenuSectionContent>
          <Background />
        </SidebarMenuSectionContent>
      </SidebarSection>
      <SidebarSection className="border-b pb-4">
        <SidebarSectionHeaderItem>
          <SidebarSectionHeaderLabel>Section Style</SidebarSectionHeaderLabel>
        </SidebarSectionHeaderItem>
        <SidebarMenuSectionContent>
          <SectionStyle />
        </SidebarMenuSectionContent>
      </SidebarSection>
      <SidebarSection className="border-b pb-4">
        <SidebarSectionHeaderItem>
          <SidebarSectionHeaderLabel>Custom CSS</SidebarSectionHeaderLabel>
        </SidebarSectionHeaderItem>
        <SidebarMenuSectionContent>
          <CustomCSS />
        </SidebarMenuSectionContent>
      </SidebarSection>
    </>
  );
}

function FontFamily() {
  const [state, dispatch] = useEditorState();

  const onFontChange = useCallback(
    (fontFamily: FormStyleSheetV1Schema["font-family"]) => {
      dispatch({
        type: "editor/theme/font-family",
        fontFamily,
      });
    },
    [dispatch]
  );

  return (
    <ToggleGroup
      type="single"
      value={state.theme.fontFamily}
      onValueChange={(value) => onFontChange(value as any)}
    >
      <ToggleGroupItem value={"inter"} className="h-full w-1/3">
        <div className="flex flex-col items-center justify-center gap-2 p-1">
          <Ag className="text-2xl" fontClassName={fonts.inter.className} />
          <span className="text-xs">Default</span>
        </div>
      </ToggleGroupItem>
      <ToggleGroupItem value={"lora"} className="h-full w-1/3">
        <div className="flex flex-col items-center justify-center gap-2 p-1">
          <Ag className="text-2xl" fontClassName={fonts.lora.className} />
          <span className="text-xs">Serif</span>
        </div>
      </ToggleGroupItem>
      <ToggleGroupItem value={"inconsolata"} className="h-full w-1/3">
        <div className="flex flex-col items-center justify-center gap-2 p-1">
          <Ag
            className="text-2xl"
            fontClassName={fonts.inconsolata.className}
          />
          <span className="text-xs">Mono</span>
        </div>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function Palette() {
  const [state, dispatch] = useEditorState();

  const palette = state.theme.palette;

  const onPaletteChange = useCallback(
    (palette: FormStyleSheetV1Schema["palette"]) => {
      dispatch({
        type: "editor/theme/palette",
        palette,
      });
    },
    [dispatch]
  );

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(variants).map((variant) => {
        const palettes = variants[variant as keyof typeof variants];
        return (
          <div key={variant} className="flex flex-col gap-2">
            <h2 className="text-sm font-mono text-muted-foreground">
              {variant}
            </h2>
            <div className="flex flex-wrap gap-1">
              {Object.keys(palettes).map((key) => {
                const colors = palettes[key as keyof typeof palettes];
                const primary: any = colors["light"]["--primary"];
                return (
                  <PaletteColorChip
                    key={key}
                    primary={primary}
                    onClick={() => {
                      onPaletteChange(key as any);
                    }}
                    selected={key === palette}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Background() {
  const [state, dispatch] = useEditorState();

  const {
    theme: { background },
    assets: { backgrounds },
  } = state;

  const onBackgroundSrcChange = useCallback(
    (src: string) => {
      dispatch({
        type: "editor/theme/background",
        background: {
          type: "background",
          element: "iframe",
          src,
        },
      });
    },
    [dispatch]
  );

  const selected = backgrounds.find((b) => b.embed === background?.src);

  return (
    <>
      <Select
        name="src"
        value={background?.src}
        onValueChange={onBackgroundSrcChange}
      >
        <SelectTrigger className={cn(selected && "h-16 px-2 py-2")}>
          <SelectValue placeholder="None">
            {selected ? (
              <div className="flex items-center gap-2">
                <Image
                  width={48}
                  height={48}
                  src={selected.preview[0]}
                  alt={selected.title}
                  className="rounded border"
                />
                <span className="text-xs text-muted-foreground">
                  {selected.title}
                </span>
              </div>
            ) : (
              <>None</>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem key={"noop"} value={""}>
            None
          </SelectItem>
          {backgrounds.map((background, i) => (
            <SelectItem key={background.embed} value={background.embed}>
              <div>
                <Image
                  width={100}
                  height={100}
                  src={background.preview[0]}
                  alt={background.title}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">
                  {background.title}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function SectionStyle() {
  const [state, dispatch] = useEditorState();

  const css = state.theme.section;

  const onSectionStyleChange = useCallback(
    (css: string) => {
      dispatch({
        type: "editor/theme/section",
        section: css,
      });
    },
    [dispatch]
  );

  return (
    <>
      <Select name="css" value={css} onValueChange={onSectionStyleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Section Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={""}>None</SelectItem>
          {sections.map((section, i) => (
            <SelectItem key={i} value={section.css}>
              {section.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function CustomCSS() {
  const [state, dispatch] = useEditorState();
  const monaco = useMonaco();
  const { resolvedTheme } = useTheme();
  useMonacoTheme(monaco, resolvedTheme ?? "light");

  const [css, setCss] = useState<string | undefined>(
    state.theme.customCSS || customcss_starter_template
  );

  const setCustomCss = useCallback(
    (css?: string) => {
      dispatch({
        type: "editor/theme/custom-css",
        custom: css,
      });
    },
    [dispatch]
  );

  const onSaveClick = useCallback(() => {
    setCustomCss(css);
  }, [setCustomCss, css]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Pencil2Icon className="w-4 h-4 inline me-2 align-middle" />
          Custom CSS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom CSS</DialogTitle>
          <DialogDescription>
            Customize Page CSS (only available through built-in pages).
            <br />
            You can Use{" "}
            <Link className="underline" href="/playground" target="_blank">
              Playground
              <OpenInNewWindowIcon className="w-4 h-4 inline align-middle ms-1" />
            </Link>{" "}
            to test your CSS
          </DialogDescription>
        </DialogHeader>
        <div>
          <Editor
            className="rounded overflow-hidden border"
            width="100%"
            height={500}
            defaultLanguage="scss"
            onChange={setCss}
            defaultValue={css}
            options={{
              // top padding
              padding: {
                top: 10,
              },
              tabSize: 2,
              fontSize: 13,
              minimap: {
                enabled: false,
              },
              glyphMargin: false,
              folding: false,
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSaveClick}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}