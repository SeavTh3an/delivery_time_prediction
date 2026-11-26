import { useEffect, useRef, useState } from "react";

const API_OPTIONS = {
  traffic_level: ["Low", "Medium", "High"],
  weather: ["Clear", "Rainy", "Foggy", "Snowy", "Windy"],
  time_of_day: ["Morning", "Afternoon", "Evening", "Night"],
  vehicle_type: ["Bike", "Scooter", "Car"],
};

const DEFAULTS = {
  distance_km: 10,
  preparation_time_min: 17,
  courier_experience_yrs: 4,
  traffic_level: "Medium",
  weather: "Clear",
  time_of_day: "Afternoon",
  vehicle_type: "Bike",
};

const EXAMPLES = {
  quick: {
    distance_km: 3,
    preparation_time_min: 8,
    courier_experience_yrs: 6,
    traffic_level: "Low",
    weather: "Clear",
    time_of_day: "Morning",
    vehicle_type: "Scooter",
  },
  rush: {
    distance_km: 9,
    preparation_time_min: 18,
    courier_experience_yrs: 3,
    traffic_level: "High",
    weather: "Rainy",
    time_of_day: "Evening",
    vehicle_type: "Car",
  },
  snow: {
    distance_km: 17,
    preparation_time_min: 25,
    courier_experience_yrs: 1,
    traffic_level: "High",
    weather: "Snowy",
    time_of_day: "Evening",
    vehicle_type: "Bike",
  },
};

const SLIDERS = [
  {
    key: "distance_km",
    label: "Distance",
    unit: "km",
    min: 0.5,
    max: 20,
    step: 0.1,
    hint: "Distance from the restaurant to the customer.",
  },
  {
    key: "preparation_time_min",
    label: "Kitchen preparation time",
    unit: "min",
    min: 5,
    max: 30,
    step: 1,
    hint: "Estimated time needed to prepare the order.",
  },
  {
    key: "courier_experience_yrs",
    label: "Courier experience",
    unit: "yrs",
    min: 0,
    max: 10,
    step: 0.5,
    hint: "How many years the courier has been delivering.",
  },
];

const OUTCOMES = ["Fast", "On time", "Late"];

const RANGE_TEXT = {
  Fast: "Likely to take under 40 minutes",
  "On time": "Likely to take 40 to 60 minutes",
  Late: "Likely to take over 60 minutes",
};

const OUTCOME_POSITION = {
  Fast: "16.6667%",
  "On time": "50%",
  Late: "83.3333%",
};

function formatProbability(value) {
  const percent = (Number(value) || 0) * 100;
  return percent < 1 ? "<1%" : `${Math.round(percent)}%`;
}

function FieldGroup({ title, options, value, onChange, traffic = false }) {
  return (
    <fieldset className="mb-6 min-w-0">
      <legend className="mb-2 text-[15px] font-semibold">{title}</legend>
      <div className={`flex flex-wrap gap-2 ${traffic ? "sm:flex-nowrap" : ""}`}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pine)] ${
                selected
                  ? traffic
                    ? option === "Low"
                      ? "border-[var(--fast)] bg-[var(--fast)] text-white"
                      : option === "Medium"
                        ? "border-[var(--ontime)] bg-[var(--ontime)] text-[#1b1500]"
                        : "border-[var(--late)] bg-[var(--late)] text-white"
                    : "border-[var(--pine)] bg-[var(--pine)] text-white"
                  : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--pine)]"
              } ${traffic ? "flex-1" : ""}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SliderField({ config, value, onChange }) {
  const { key, label, unit, min, max, step, hint } = config;
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={key} className="text-[15px] font-semibold">
          {label}
        </label>
        <output htmlFor={key} className="font-display text-lg font-bold tabular-nums">
          {value} {unit}
        </output>
      </div>
      <input
        id={key}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="delivery-range w-full"
      />
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
    </div>
  );
}

function ProbabilityRow({ outcome, probability }) {
  const percent = Math.max(0, Math.min(100, (Number(probability) || 0) * 100));
  return (
    <div className="mb-3 grid grid-cols-[64px_minmax(0,1fr)_48px] items-center gap-3 text-sm">
      <span>{outcome}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--paper)]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            outcome === "Fast"
              ? "bg-[var(--fast)]"
              : outcome === "On time"
                ? "bg-[var(--ontime)]"
                : "bg-[var(--late)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <strong className="text-right tabular-nums">{formatProbability(probability)}</strong>
    </div>
  );
}

function ResultPanel({ result, loading, error }) {
  const prediction = result?.prediction;
  const probabilities = result?.probabilities ?? {};

  return (
    <aside
      aria-live="polite"
      className={`result-panel sticky top-5 rounded-xl border border-[var(--line)] border-t-[6px] bg-[var(--surface)] p-6 ${
        prediction ? `outcome-${prediction.replace(" ", "-").toLowerCase()}` : ""
      } ${!result ? "opacity-70" : ""}`}
    >
      <p className="text-sm text-[var(--muted)]">Predicted delivery</p>
      <div className="font-display my-2 text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
        {loading ? "…" : prediction ?? "—"}
      </div>
      <p className="mb-7 text-base">
        {loading
          ? "Checking your order details…"
          : prediction
            ? RANGE_TEXT[prediction]
            : "Waiting for the model"}
      </p>

      <div className="relative mb-7 pt-8">
        <div
          className="absolute top-0 z-10 -translate-x-1/2 transition-all duration-500"
          style={{ left: OUTCOME_POSITION[prediction] ?? "50%" }}
        >
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
            <path
              d="M16 31C16 31 4 19.5 4 12a12 12 0 1 1 24 0c0 7.5-12 19-12 19Z"
              fill="currentColor"
            />
            <circle cx="16" cy="12" r="4.5" fill="var(--surface)" />
          </svg>
        </div>
        <div className="grid h-3 grid-cols-3 gap-[3px] overflow-hidden rounded-md">
          <div className={`bg-[var(--fast)] ${prediction === "Fast" ? "opacity-100" : "opacity-30"}`} />
          <div className={`bg-[var(--ontime)] ${prediction === "On time" ? "opacity-100" : "opacity-30"}`} />
          <div className={`bg-[var(--late)] ${prediction === "Late" ? "opacity-100" : "opacity-30"}`} />
        </div>
        <div className="mt-2 grid grid-cols-3 text-center text-xs text-[var(--muted)]">
          <span><strong className="block text-[var(--ink)]">Fast</strong>under 40 min</span>
          <span><strong className="block text-[var(--ink)]">On time</strong>40–60 min</span>
          <span><strong className="block text-[var(--ink)]">Late</strong>over 60 min</span>
        </div>
      </div>

      <div className="mb-5">
        {OUTCOMES.map((outcome) => (
          <ProbabilityRow
            key={outcome}
            outcome={outcome}
            probability={probabilities[outcome]}
          />
        ))}
      </div>

      {prediction && Number(probabilities[prediction]) < 0.7 && (
        <p className="mb-5 rounded-lg bg-[var(--pine-soft)] px-3.5 py-3 text-sm">
          Close call: this order sits near a cutoff, so the model is less sure.
          Borderline orders are harder to predict.
        </p>
      )}

      {error && (
        <div className="mb-5 rounded-lg border-l-4 border-[var(--late)] bg-[var(--paper)] p-4 text-sm">
          <strong className="block">Can’t reach the model.</strong>
          <span>Check that your FastAPI server is running and the API address is correct.</span>
          <code className="mt-2 block overflow-x-auto rounded bg-[var(--surface)] p-2 text-xs">
            python -m uvicorn api:app --reload
          </code>
          <p className="mt-2 break-words text-xs text-[var(--muted)]">{error}</p>
        </div>
      )}

      <div className="border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
        <p className="mb-2">
          <strong className="text-[var(--ink)]">What the model weighs most:</strong>{" "}
          distance first, then preparation time, snowy weather and traffic.
        </p>
        <p>
          Clear weather and an experienced courier push an order away from late.
          Overall it was right on 84% of unseen test orders.
        </p>
      </div>
    </aside>
  );
}

export default function App() {
  const [form, setForm] = useState(DEFAULTS);
  const [apiBase, setApiBase] = useState("http://127.0.0.1:8000");
  const [apiStatus, setApiStatus] = useState("wait");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const runPrediction = async (values = form, base = apiBase) => {
    const sequence = ++requestSequence.current;
    const cleanBase = base.trim().replace(/\/+$/, "");

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${cleanBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`API error ${response.status}: ${detail}`);
      }

      const data = await response.json();
      if (sequence !== requestSequence.current) return;

      setResult(data);
      setApiStatus("ok");
    } catch (requestError) {
      if (sequence !== requestSequence.current) return;
      setApiStatus("down");
      setError(requestError.message || "Unknown network error");
      setResult(null);
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => runPrediction(form), 250);
    return () => window.clearTimeout(timer);
    // The request is intentionally debounced whenever an input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBase.trim().replace(/\/+$/, "")}/health`);
        if (!response.ok) throw new Error("Health check failed");
        if (active) setApiStatus("ok");
      } catch {
        if (active) setApiStatus("down");
      }
    };
    checkHealth();
    return () => {
      active = false;
    };
  }, [apiBase]);

  const applyExample = (name) => {
    setForm(EXAMPLES[name]);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="font-display mb-2 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            Delivery time check
          </h1>
          <p className="max-w-xl text-[var(--muted)]">
            Describe an order and the model tells you whether it will arrive fast,
            on time or late.
          </p>
        </div>
        <div
          role="status"
          className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--muted)]"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              apiStatus === "ok"
                ? "bg-[var(--fast)]"
                : apiStatus === "down"
                  ? "bg-[var(--late)]"
                  : "bg-[var(--ontime)]"
            }`}
          />
          {apiStatus === "ok"
            ? "Model connected"
            : apiStatus === "down"
              ? "Model not reachable"
              : "Connecting to the model…"}
        </div>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[1.05fr_1fr]">
        <section aria-label="Order details">
          <h2 className="font-display mb-4 text-xl font-bold">The order</h2>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-[var(--muted)]">Try an example:</span>
            <button type="button" className="example-button" onClick={() => applyExample("quick")}>
              Short hop, clear skies
            </button>
            <button type="button" className="example-button" onClick={() => applyExample("rush")}>
              Rush hour downtown
            </button>
            <button type="button" className="example-button" onClick={() => applyExample("snow")}>
              Long ride in the snow
            </button>
          </div>

          <form
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 pt-6 sm:px-6"
            onSubmit={(event) => event.preventDefault()}
          >
            {SLIDERS.map((slider) => (
              <SliderField
                key={slider.key}
                config={slider}
                value={form[slider.key]}
                onChange={(value) => updateField(slider.key, value)}
              />
            ))}

            <FieldGroup
              title="Traffic"
              options={API_OPTIONS.traffic_level}
              value={form.traffic_level}
              onChange={(value) => updateField("traffic_level", value)}
              traffic
            />
            <FieldGroup
              title="Weather"
              options={API_OPTIONS.weather}
              value={form.weather}
              onChange={(value) => updateField("weather", value)}
            />
            <FieldGroup
              title="Time of day"
              options={API_OPTIONS.time_of_day}
              value={form.time_of_day}
              onChange={(value) => updateField("time_of_day", value)}
            />
            <FieldGroup
              title="Vehicle"
              options={API_OPTIONS.vehicle_type}
              value={form.vehicle_type}
              onChange={(value) => updateField("vehicle_type", value)}
            />
            <p className="mb-5 -mt-2 text-xs text-[var(--muted)]">
              Slider ranges are UI defaults. The API accepts distance 0–100 km,
              preparation time 0–120 min and courier experience 0–50 years.
            </p>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <label htmlFor="apiBase" className="font-medium">API address</label>
            <input
              id="apiBase"
              value={apiBase}
              onChange={(event) => setApiBase(event.target.value)}
              onBlur={() => runPrediction(form, apiBase)}
              spellCheck="false"
              className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-[var(--ink)] outline-none focus:border-[var(--pine)]"
            />
            <button
              type="button"
              onClick={() => runPrediction(form, apiBase)}
              disabled={loading}
              className="rounded-md bg-[var(--pine)] px-3 py-1.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Checking…" : "Predict"}
            </button>
          </div>
        </section>

        <ResultPanel result={result} loading={loading} error={error} />
      </div>
    </main>
  );
}
