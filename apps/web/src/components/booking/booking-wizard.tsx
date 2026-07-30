"use client";

import { useReducer, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  formatDateLongPtBR,
  type AppointmentResult,
  type BlockedDate,
  type Service,
  type Slot,
  type WaitlistResult,
  type WeeklyDay,
} from "@simone/shared";
import { ApiError, createAppointment, getSlots, joinWaitlist } from "@/lib/api";
import { CalendarStep } from "./calendar-step";
import { DetailsStep } from "./details-step";
import { DoneScreen } from "./done-screen";
import { ServiceStep } from "./service-step";
import { TimeStep } from "./time-step";
import { WaitDoneScreen } from "./wait-done-screen";
import { WizardShell } from "./wizard-shell";

type Step = "date" | "time" | "service" | "details";
type Mode = "booking" | "waitlist";
const STEP_ORDER: Step[] = ["date", "time", "service", "details"];

interface WizardState {
  screen: "form" | "done" | "waitDone";
  step: Step;
  mode: Mode;
  monthOffset: number;
  date: string | null;
  time: string | null;
  serviceId: string | null;
  name: string;
  whats: string;
  email: string;
  submitting: boolean;
  error: string | null;
  result: AppointmentResult | WaitlistResult | null;
}

const initialState: WizardState = {
  screen: "form",
  step: "date",
  mode: "booking",
  monthOffset: 0,
  date: null,
  time: null,
  serviceId: null,
  name: "",
  whats: "",
  email: "",
  submitting: false,
  error: null,
  result: null,
};

type Action =
  | { type: "SET_MONTH_OFFSET"; offset: number }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SELECT_TIME"; time: string; mode: Mode }
  | { type: "SELECT_SERVICE"; serviceId: string }
  | { type: "SET_FIELD"; field: "name" | "whats" | "email"; value: string }
  | { type: "GO_STEP"; step: Step }
  | { type: "BACK" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | {
      type: "SUBMIT_SUCCESS";
      screen: "done" | "waitDone";
      result: AppointmentResult | WaitlistResult;
    }
  | { type: "RESTART" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_MONTH_OFFSET":
      return { ...state, monthOffset: action.offset };
    case "SELECT_DATE":
      return { ...state, date: action.date, time: null };
    case "SELECT_TIME":
      return { ...state, time: action.time, mode: action.mode };
    case "SELECT_SERVICE":
      return { ...state, serviceId: action.serviceId };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "GO_STEP":
      return { ...state, step: action.step, error: null };
    case "BACK": {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx <= 0) return state;
      return { ...state, step: STEP_ORDER[idx - 1], error: null };
    }
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.error };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, screen: action.screen, result: action.result };
    case "RESTART":
      return initialState;
    default:
      return state;
  }
}

function canAdvance(state: WizardState): boolean {
  switch (state.step) {
    case "date":
      return state.date !== null;
    case "time":
      return state.time !== null;
    case "service":
      return state.serviceId !== null;
    case "details":
      return state.name.trim().length >= 2 && state.whats.trim().length >= 8;
  }
}

interface BookingWizardProps {
  services: Service[];
  weekly: WeeklyDay[];
  blocks: BlockedDate[];
  whatsappNumber: string;
}

export function BookingWizard({ services, weekly, blocks, whatsappNumber }: BookingWizardProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dayOpen, setDayOpen] = useState<{ open: boolean; reason: string | null } | null>(null);

  useEffect(() => {
    if (!state.date) return;
    let cancelled = false;
    setSlotsLoading(true);
    getSlots(state.date)
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
        setDayOpen({ open: res.open, reason: res.reason });
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setDayOpen({ open: false, reason: "Não foi possível carregar os horários agora." });
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state.date]);

  const activeServices = services.filter((s) => s.active);
  const selectedService = activeServices.find((s) => s.id === state.serviceId) ?? null;

  async function handlePrimary() {
    if (!canAdvance(state)) return;

    if (state.step !== "details") {
      const idx = STEP_ORDER.indexOf(state.step);
      dispatch({ type: "GO_STEP", step: STEP_ORDER[idx + 1] });
      return;
    }

    if (!state.date || !state.time || !state.serviceId) return;
    dispatch({ type: "SUBMIT_START" });

    try {
      if (state.mode === "booking") {
        const result = await createAppointment({
          date: state.date,
          startTime: state.time,
          serviceId: state.serviceId,
          clientName: state.name.trim(),
          clientWhatsapp: state.whats.trim(),
          clientEmail: state.email.trim() || undefined,
        });
        dispatch({ type: "SUBMIT_SUCCESS", screen: "done", result });
      } else {
        const result = await joinWaitlist({
          date: state.date,
          time: state.time,
          serviceId: state.serviceId,
          clientName: state.name.trim(),
          clientWhatsapp: state.whats.trim(),
        });
        dispatch({ type: "SUBMIT_SUCCESS", screen: "waitDone", result });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Algo deu errado. Tente de novo em instantes.";
      dispatch({ type: "SUBMIT_ERROR", error: message });
    }
  }

  if (state.screen === "done" && state.result) {
    return (
      <DoneScreen
        appointment={state.result as AppointmentResult}
        whatsappNumber={whatsappNumber}
        onRestart={() => router.push("/")}
      />
    );
  }

  if (state.screen === "waitDone" && state.result) {
    return (
      <WaitDoneScreen entry={state.result as WaitlistResult} onRestart={() => router.push("/")} />
    );
  }

  const stepIndex = STEP_ORDER.indexOf(state.step);
  const titles: Record<Step, string> = {
    date: "Escolha a data",
    time: "Escolha o horário",
    service: "Escolha o serviço",
    details: state.mode === "waitlist" ? "Lista de espera" : "Seus dados",
  };
  const primaryLabel =
    state.step === "details"
      ? state.mode === "waitlist"
        ? "Entrar na lista de espera"
        : "Confirmar agendamento"
      : "Continuar";

  return (
    <WizardShell
      title={titles[state.step]}
      stepIndex={stepIndex}
      stepCount={STEP_ORDER.length}
      onBack={() => {
        if (stepIndex === 0) router.push("/");
        else dispatch({ type: "BACK" });
      }}
      primaryLabel={primaryLabel}
      primaryDisabled={!canAdvance(state) || state.submitting}
      submitting={state.submitting}
      onPrimary={handlePrimary}
      error={state.error}
    >
      {state.step === "date" && (
        <CalendarStep
          weekly={weekly}
          blocks={blocks}
          monthOffset={state.monthOffset}
          selectedDate={state.date}
          onSelectDate={(date) => dispatch({ type: "SELECT_DATE", date })}
          onMonthOffsetChange={(offset) => dispatch({ type: "SET_MONTH_OFFSET", offset })}
        />
      )}
      {state.step === "time" && (
        <TimeStep
          dateLabel={state.date ? formatDateLongPtBR(state.date) : ""}
          slots={slots}
          loading={slotsLoading}
          dayOpen={dayOpen}
          selectedTime={state.time}
          onSelectTime={(time, available) =>
            dispatch({ type: "SELECT_TIME", time, mode: available ? "booking" : "waitlist" })
          }
        />
      )}
      {state.step === "service" && (
        <ServiceStep
          services={activeServices}
          selectedServiceId={state.serviceId}
          onSelect={(serviceId) => dispatch({ type: "SELECT_SERVICE", serviceId })}
        />
      )}
      {state.step === "details" && (
        <DetailsStep
          mode={state.mode}
          dateLabel={state.date ? formatDateLongPtBR(state.date) : ""}
          time={state.time ?? ""}
          service={selectedService}
          name={state.name}
          whats={state.whats}
          email={state.email}
          onChangeName={(name) => dispatch({ type: "SET_FIELD", field: "name", value: name })}
          onChangeWhats={(whats) => dispatch({ type: "SET_FIELD", field: "whats", value: whats })}
          onChangeEmail={(email) => dispatch({ type: "SET_FIELD", field: "email", value: email })}
        />
      )}
    </WizardShell>
  );
}
