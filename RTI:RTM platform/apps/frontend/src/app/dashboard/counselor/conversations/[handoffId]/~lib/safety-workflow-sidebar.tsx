"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  GraduationCap,
  User,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  cancelSafetyWorkflow,
  fetchEmergencyContacts,
  updateWorkflowActData,
  updateWorkflowAssessment,
  updateWorkflowConcernType,
  updateWorkflowDanger,
  updateWorkflowRiskLevel,
} from "./safety-workflow-actions";
import { StepDanger } from "./safety-workflow-step-danger";
import { SafetyWorkflowStepNav } from "./safety-workflow-step-nav";
import { StepType } from "./safety-workflow-step-type";
import { completeSafetyWorkflow } from "./safety-workflow-submit";
import type {
  AssessAbuseNeglectData,
  AssessHarmOthersData,
  AssessHarmSelfData,
  AssessOtherSafetyData,
  ConcernType,
  DocumentData,
  EmergencyActionsData,
  EmergencyContactInfo,
  RiskLevel,
  SafetyPlanData,
  SafetyWorkflowData,
  SafetyWorkflowStep,
} from "./safety-workflow-types";
import {
  EMPTY_ABUSE_NEGLECT,
  EMPTY_DOCUMENT_DATA,
  EMPTY_EMERGENCY_ACTIONS,
  EMPTY_HARM_OTHERS,
  EMPTY_HARM_SELF,
  EMPTY_OTHER_SAFETY,
  EMPTY_SAFETY_PLAN,
} from "./safety-workflow-types";
import { StepActEmergency } from "./step-act-emergency";
import { StepActSafetyPlan } from "./step-act-safety-plan";
import { StepAssessAbuseNeglect } from "./step-assess-abuse-neglect";
import { StepAssessHarmOthers } from "./step-assess-harm-others";
import { StepAssessHarmSelf } from "./step-assess-harm-self";
import { StepAssessOtherSafety } from "./step-assess-other-safety";
import { StepDocument } from "./step-document";
import { StepLevel } from "./step-level";
import { StepReturn } from "./step-return";
import { StepSend } from "./step-send";

type Props = {
  workflow: SafetyWorkflowData;
  schoolName?: string;
  studentDateOfBirth?: string | null;
  coachName: string;
  onClose: () => void;
};

function deriveInitialStep(w: SafetyWorkflowData): SafetyWorkflowStep {
  // Immediate danger → already went to act (emergency)
  if (w.immediateDanger === true) {
    return w.actData ? "document" : "act";
  }
  if (w.immediateDanger !== null && !w.immediateDanger) {
    if (w.concernType) {
      if (w.assessmentData) {
        if (w.riskLevel) return w.actData ? "document" : "act";
        return "level";
      }
      return "assess";
    }
    return "type";
  }
  return "danger";
}

function deriveCompletedSteps(w: SafetyWorkflowData): SafetyWorkflowStep[] {
  const s: SafetyWorkflowStep[] = [];
  if (w.immediateDanger !== null) s.push("danger");
  if (w.concernType) s.push("type");
  if (w.assessmentData) s.push("assess");
  if (w.riskLevel) s.push("level");
  if (w.actData) s.push("act");
  return s;
}

export function SafetyWorkflowSidebar({
  workflow,
  schoolName,
  studentDateOfBirth,
  coachName,
  onClose,
}: Props) {
  const [currentStep, setCurrentStep] = useState<SafetyWorkflowStep>(() =>
    deriveInitialStep(workflow),
  );
  const [completedSteps, setCompletedSteps] = useState<SafetyWorkflowStep[]>(
    () => deriveCompletedSteps(workflow),
  );
  const [dangerValue, setDangerValue] = useState<boolean | null>(
    workflow.immediateDanger,
  );
  const [concernType, setConcernType] = useState<ConcernType | null>(
    workflow.concernType,
  );
  const [assessHarmSelf, setAssessHarmSelf] = useState<AssessHarmSelfData>(
    (workflow.assessmentData as AssessHarmSelfData) ?? EMPTY_HARM_SELF,
  );
  const [assessHarmOthers, setAssessHarmOthers] =
    useState<AssessHarmOthersData>(
      (workflow.assessmentData as AssessHarmOthersData) ?? EMPTY_HARM_OTHERS,
    );
  const [assessAbuse, setAssessAbuse] = useState<AssessAbuseNeglectData>(
    (workflow.assessmentData as AssessAbuseNeglectData) ?? EMPTY_ABUSE_NEGLECT,
  );
  const [assessOther, setAssessOther] = useState<AssessOtherSafetyData>(
    (workflow.assessmentData as AssessOtherSafetyData) ?? EMPTY_OTHER_SAFETY,
  );
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(
    workflow.riskLevel,
  );
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>(
    (workflow.actData as unknown as SafetyPlanData) ?? EMPTY_SAFETY_PLAN,
  );
  const [emergencyActions, setEmergencyActions] =
    useState<EmergencyActionsData>(
      (workflow.actData as unknown as EmergencyActionsData) ??
        EMPTY_EMERGENCY_ACTIONS,
    );
  const [documentData, setDocumentData] =
    useState<DocumentData>(EMPTY_DOCUMENT_DATA);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContactInfo[]
  >([]);
  const [isPending, startTransition] = useTransition();

  // Fetch emergency contacts on mount
  useEffect(() => {
    fetchEmergencyContacts(workflow.studentId, workflow.schoolId).then(
      setEmergencyContacts,
    );
  }, [workflow.studentId, workflow.schoolId]);

  const activatedDate = (() => {
    const date = new Date(workflow.activatedAt);
    return format(date, "MMM d, yyyy - h:mm a");
  })();

  function markDone(step: SafetyWorkflowStep) {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }

  function getAssessData(): Record<string, unknown> {
    switch (concernType) {
      case "harm_to_self":
        return assessHarmSelf as unknown as Record<string, unknown>;
      case "harm_to_others":
        return assessHarmOthers as unknown as Record<string, unknown>;
      case "abuse_neglect":
        return assessAbuse as unknown as Record<string, unknown>;
      case "other_safety":
        return assessOther as unknown as Record<string, unknown>;
      default:
        return {};
    }
  }

  function getActData(): Record<string, unknown> {
    if (dangerValue) {
      return emergencyActions as unknown as Record<string, unknown>;
    }
    return safetyPlan as unknown as Record<string, unknown>;
  }

  function handleContinue() {
    startTransition(async () => {
      if (currentStep === "danger" && dangerValue !== null) {
        await updateWorkflowDanger(workflow.id, dangerValue);
        markDone("danger");
        if (dangerValue) {
          // Immediate danger → skip to emergency actions (Step 5B)
          setCurrentStep("act");
        } else {
          setCurrentStep("type");
        }
      } else if (currentStep === "type" && concernType !== null) {
        await updateWorkflowConcernType(workflow.id, concernType);
        markDone("type");
        setCurrentStep("assess");
      } else if (currentStep === "assess") {
        await updateWorkflowAssessment(workflow.id, getAssessData());
        markDone("assess");
        setCurrentStep("level");
      } else if (currentStep === "level" && riskLevel !== null) {
        await updateWorkflowRiskLevel(workflow.id, riskLevel);
        markDone("level");
        setCurrentStep("act");
      } else if (currentStep === "act") {
        await updateWorkflowActData(workflow.id, getActData());
        markDone("act");
        setCurrentStep("document");
      } else if (currentStep === "document") {
        markDone("document");
        setCurrentStep("send");
      } else if (currentStep === "send") {
        await completeSafetyWorkflow(
          workflow.id,
          documentData,
          concernType,
          riskLevel,
          concernType ? getAssessData() : null,
        );
        markDone("send");
        setCurrentStep("return");
      }
    });
  }

  function handleBack() {
    if (currentStep === "type") setCurrentStep("danger");
    else if (currentStep === "assess") setCurrentStep("type");
    else if (currentStep === "level") setCurrentStep("assess");
    else if (currentStep === "act") {
      setCurrentStep(dangerValue ? "danger" : "level");
    } else if (currentStep === "document") setCurrentStep("act");
    else if (currentStep === "send") setCurrentStep("document");
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelSafetyWorkflow(workflow.id);
      onClose();
    });
  }

  const isEmergencyAct = currentStep === "act" && dangerValue === true;

  const allEmergencyActionsComplete =
    emergencyActions.emergencyServices?.complete &&
    emergencyActions.notifySchool?.complete &&
    emergencyActions.notifyParent?.complete &&
    emergencyActions.continueConversation?.complete;

  const canContinue =
    (currentStep === "danger" && dangerValue !== null) ||
    (currentStep === "type" && concernType !== null) ||
    currentStep === "assess" ||
    (currentStep === "level" && riskLevel !== null) ||
    (currentStep === "act" && isEmergencyAct && allEmergencyActionsComplete) ||
    (currentStep === "act" && !isEmergencyAct) ||
    (currentStep === "document" &&
      documentData.situationSummary.trim() !== "" &&
      documentData.studentStatement.trim() !== "") ||
    currentStep === "send";

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-gray-200 border-l bg-white">
      {/* Header */}
      <div className="bg-red-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">SAFETY WORKFLOW ACTIVATED</h2>
          {currentStep !== "return" && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-white/80 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-red-100 text-xs">
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {workflow.studentName}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="size-3" />
            {workflow.studentGrade}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {activatedDate}
          </span>
          <span className="rounded bg-red-700 px-2 py-0.5 font-semibold text-[10px]">
            {workflow.isDuringSchoolHours
              ? "During school hours"
              : "After school hours"}
          </span>
        </div>
      </div>

      <SafetyWorkflowStepNav
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Step content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {currentStep === "danger" && (
          <StepDanger value={dangerValue} onChange={setDangerValue} />
        )}
        {currentStep === "type" && (
          <StepType value={concernType} onChange={setConcernType} />
        )}
        {currentStep === "assess" && concernType === "harm_to_self" && (
          <StepAssessHarmSelf
            value={assessHarmSelf}
            onChange={setAssessHarmSelf}
          />
        )}
        {currentStep === "assess" && concernType === "harm_to_others" && (
          <StepAssessHarmOthers
            value={assessHarmOthers}
            onChange={setAssessHarmOthers}
          />
        )}
        {currentStep === "assess" && concernType === "abuse_neglect" && (
          <StepAssessAbuseNeglect
            value={assessAbuse}
            onChange={setAssessAbuse}
          />
        )}
        {currentStep === "assess" && concernType === "other_safety" && (
          <StepAssessOtherSafety
            value={assessOther}
            onChange={setAssessOther}
          />
        )}
        {currentStep === "level" && concernType && (
          <StepLevel
            concernType={concernType}
            assessmentData={getAssessData()}
            value={riskLevel}
            onChange={setRiskLevel}
          />
        )}
        {currentStep === "act" && !isEmergencyAct && (
          <StepActSafetyPlan value={safetyPlan} onChange={setSafetyPlan} />
        )}
        {isEmergencyAct && (
          <StepActEmergency
            isDuringSchoolHours={workflow.isDuringSchoolHours}
            contacts={emergencyContacts}
            value={emergencyActions}
            onChange={setEmergencyActions}
          />
        )}
        {currentStep === "document" && (
          <StepDocument
            value={documentData}
            onChange={setDocumentData}
            schoolName={schoolName ?? ""}
            studentName={workflow.studentName}
            studentGrade={workflow.studentGrade}
            concernType={concernType}
            riskLevel={riskLevel}
          />
        )}
        {currentStep === "send" && (
          <StepSend
            workflow={workflow}
            schoolName={schoolName ?? ""}
            studentDateOfBirth={studentDateOfBirth ?? null}
            documentData={documentData}
            concernType={concernType}
            riskLevel={riskLevel}
            coachName={coachName}
            onEditDocument={() => setCurrentStep("document")}
          />
        )}
        {currentStep === "return" && (
          <StepReturn
            studentName={workflow.studentName}
            schoolName={schoolName ?? ""}
            submittedAt={new Date().toISOString()}
          />
        )}
      </div>

      {/* Footer */}
      {currentStep === "return" ? (
        <div className="border-gray-200 border-t p-4">
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Return to Conversation
          </Button>
        </div>
      ) : (
        <div className="space-y-2 border-gray-200 border-t p-4">
          <Button
            className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleContinue}
            disabled={!canContinue || isPending}
          >
            {currentStep === "send" ? "Submit" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
          <div className="flex gap-2">
            {currentStep !== "danger" && (
              <Button
                variant="outline"
                className="flex-1 gap-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                onClick={handleBack}
                disabled={isPending}
              >
                <ArrowLeft className="size-3" />
                Back
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
