import manifest from "./manifest.json";
import type { ModuleMeta, MCQQuestion, CardQuestion } from "./types";

import html from "./html.json";
import css from "./css.json";
import javascript from "./javascript.json";
import bootstrap from "./bootstrap.json";
import designUx from "./design-ux.json";
import toolsWorkflow from "./tools-workflow.json";
import colorTheory from "./color-theory.json";
import practiceTest1 from "./practice-test-1.json";
import writtenL3Mcq from "./written-l3-mcq.json";
import flashHtml from "./flash-html.json";
import flashCss from "./flash-css.json";
import flashJs from "./flash-js.json";
import flashJquery from "./flash-jquery.json";
import flashBootstrap from "./flash-bootstrap.json";
import flashGeneral from "./flash-general.json";

const MODULE_DATA: Record<string, (MCQQuestion | CardQuestion)[]> = {
  html: html as MCQQuestion[],
  css: css as MCQQuestion[],
  javascript: javascript as MCQQuestion[],
  bootstrap: bootstrap as MCQQuestion[],
  "design-ux": designUx as MCQQuestion[],
  "tools-workflow": toolsWorkflow as MCQQuestion[],
  "color-theory": colorTheory as MCQQuestion[],
  "practice-test-1": practiceTest1 as MCQQuestion[],
  "written-l3-mcq": writtenL3Mcq as MCQQuestion[],
  "flash-html": flashHtml as CardQuestion[],
  "flash-css": flashCss as CardQuestion[],
  "flash-js": flashJs as CardQuestion[],
  "flash-jquery": flashJquery as CardQuestion[],
  "flash-bootstrap": flashBootstrap as CardQuestion[],
  "flash-general": flashGeneral as CardQuestion[],
};

export const MODULES: ModuleMeta[] = manifest as ModuleMeta[];

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getModuleQuestions(id: string): (MCQQuestion | CardQuestion)[] {
  return MODULE_DATA[id] ?? [];
}

export function getAllMcqQuestions(): MCQQuestion[] {
  return MODULES.filter((m) => m.kind === "mcq").flatMap(
    (m) => MODULE_DATA[m.id] as MCQQuestion[]
  );
}

export function getAllModuleIds(): string[] {
  return MODULES.map((m) => m.id);
}
