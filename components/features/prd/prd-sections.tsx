"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { PRDContent } from "@/lib/mocks/prd";

interface SectionProps {
  prd: PRDContent;
}

function SectionHeader({
  number,
  title,
  copyValue,
}: {
  number: string;
  title: string;
  copyValue?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-4 group">
      <div>
        <span className="font-mono text-2xl text-muted-foreground">{number}</span>
        <h3 className="font-display text-xl font-semibold mt-1">{title}</h3>
      </div>
      {copyValue && (
        <CopyButton
          value={copyValue}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );
}

export function OverviewSection({ prd }: SectionProps) {
  return (
    <section id="overview" className="scroll-mt-24">
      <SectionHeader
        number="01"
        title="Project Overview"
        copyValue={`${prd.projectOverview.productName}\n\n${prd.projectOverview.description}`}
      />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Product Name
          </h4>
          <p className="font-display text-lg">{prd.projectOverview.productName}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Description
          </h4>
          <p className="leading-relaxed">{prd.projectOverview.description}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Target Audience
          </h4>
          <p className="leading-relaxed">{prd.projectOverview.targetAudience}</p>
        </div>
      </div>
    </section>
  );
}

export function GoalsSection({ prd }: SectionProps) {
  return (
    <section id="goals" className="scroll-mt-24">
      <SectionHeader number="02" title="Purpose & Goals" />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Problem Statement
          </h4>
          <p className="leading-relaxed">{prd.purposeAndGoals.problemStatement}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Solution
          </h4>
          <p className="leading-relaxed">{prd.purposeAndGoals.solution}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Key Objectives
          </h4>
          <ul className="space-y-2">
            {prd.purposeAndGoals.keyObjectives.map((objective, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-mono text-sm">{i + 1}.</span>
                <span className="leading-relaxed">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PersonasSection({ prd }: SectionProps) {
  return (
    <section id="personas" className="scroll-mt-24">
      <SectionHeader number="03" title="User Personas" />
      <div className="grid gap-4">
        {prd.userPersonas.map((persona) => (
          <Card key={persona.name} className="card-editorial">
            <CardContent className="p-4">
              <h4 className="font-display font-semibold">{persona.name}</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {persona.description}
              </p>
              <div className="mt-3">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                  Use Cases
                </h5>
                <ul className="space-y-1">
                  {persona.useCases.map((useCase, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-primary">•</span>
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function TechStackSection({ prd }: SectionProps) {
  const categories = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "auth", label: "Auth" },
    { key: "hosting", label: "Hosting" },
  ] as const;

  return (
    <section id="techstack" className="scroll-mt-24">
      <SectionHeader number="04" title="Tech Stack" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(({ key, label }) => (
          <div key={key} className="p-3 rounded-lg bg-muted/30">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              {label}
            </span>
            <p className="text-sm font-medium mt-1">
              {prd.techStack[key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturesSection({ prd }: SectionProps) {
  return (
    <section id="features" className="scroll-mt-24">
      <SectionHeader number="05" title="Features" />
      <div className="space-y-6">
        {/* MVP Features */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            MVP Features
            <Badge variant="secondary" className="bg-success/20 text-success">
              {prd.features.mvpFeatures.length}
            </Badge>
          </h4>
          <div className="space-y-3">
            {prd.features.mvpFeatures.map((feature) => (
              <Card key={feature.name} className="card-editorial">
                <CardContent className="p-4">
                  <h5 className="font-medium">{feature.name}</h5>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nice to Have */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Nice to Have
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {prd.features.niceToHaveFeatures.length}
            </Badge>
          </h4>
          <div className="space-y-3">
            {prd.features.niceToHaveFeatures.map((feature) => (
              <Card key={feature.name} className="card-editorial opacity-75">
                <CardContent className="p-4">
                  <h5 className="font-medium">{feature.name}</h5>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Out of Scope */}
        <div>
          <h4 className="text-sm font-medium mb-3">Out of Scope</h4>
          <ul className="space-y-1">
            {prd.features.outOfScope.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span>×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ArchitectureSection({ prd }: SectionProps) {
  return (
    <section id="architecture" className="scroll-mt-24">
      <SectionHeader number="06" title="Technical Architecture" />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            System Design
          </h4>
          <p className="leading-relaxed">
            {prd.technicalArchitecture.systemDesign}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Data Models
          </h4>
          <div className="space-y-3">
            {prd.technicalArchitecture.dataModels.map((model) => (
              <Card key={model.modelName} className="card-editorial">
                <CardContent className="p-4">
                  <h5 className="font-mono text-sm font-semibold">
                    {model.modelName}
                  </h5>
                  <ul className="mt-2 space-y-1">
                    {model.fields.map((field, i) => (
                      <li key={i} className="text-xs font-mono text-muted-foreground">
                        {field}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function UIUXSection({ prd }: SectionProps) {
  return (
    <section id="uiux" className="scroll-mt-24">
      <SectionHeader number="07" title="UI/UX Considerations" />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Design Approach
          </h4>
          <p className="leading-relaxed">
            {prd.uiUxConsiderations.designApproach}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Key User Flows
          </h4>
          <ul className="space-y-2">
            {prd.uiUxConsiderations.keyUserFlows.map((flow, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary font-mono">{i + 1}.</span>
                <span className="leading-relaxed">{flow}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
