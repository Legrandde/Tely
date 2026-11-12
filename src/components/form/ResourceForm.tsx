import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import api from "../../api/axio";
import type { FieldConfig, ResourceSchema, SelectOption } from "../../types/forms";

interface ResourceFormProps {
  schema: ResourceSchema;
  initialValues?: Record<string, unknown>;
  resourceId?: string | number; // si présent => mode édition
  onSuccess?: (result: unknown) => void;
  onCancel?: () => void;
}

export default function ResourceForm({
  schema,
  initialValues = {},
  resourceId,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [asyncOptions, setAsyncOptions] = useState<Record<string, SelectOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string>();
  const [extractingField, setExtractingField] = useState<string | null>(null);

  const isEditMode = !!resourceId;

  // Charge les options des selects async au montage
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoadingOptions(true);
      const asyncFields = schema.fields.filter((f) => f.type === "select-async" && f.loadOptions);
      const entries = await Promise.all(
        asyncFields.map(async (f) => {
          try {
            const opts = await f.loadOptions!();
            return [f.name, opts] as const;
          } catch {
            return [f.name, []] as const;
          }
        })
      );
      if (!cancelled) {
        setAsyncOptions(Object.fromEntries(entries));
        setLoadingOptions(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [schema]);

  function setValue(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const field of schema.fields) {
      if (field.required && !values[field.name] && values[field.name] !== false) {
        errs[field.name] = "Ce champ est obligatoire";
      }
    }
    return errs;
  }

  async function handlePdfExtract(fieldName: string, file: File) {
    setExtractingField(fieldName);
    setGlobalError(undefined);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const { data } = await api.post<{ success: boolean; text: string; filename: string }>(
        "/api/pdf/extract-text",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (data.text) {
        setValue(fieldName, data.text);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible d'extraire le texte de ce fichier PDF. Assurez-vous qu'il contient du texte lisible.";
      setGlobalError(errorMsg);
    } finally {
      setExtractingField(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setGlobalError(undefined);
    setLoading(true);
    try {
      const result = isEditMode
        ? await schema.update(resourceId!, values)
        : await schema.create(values);
      onSuccess?.(result);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Une erreur est survenue lors de l'enregistrement.";
      setGlobalError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function renderField(field: FieldConfig) {
    const error = errors[field.name];
    const baseInputClass = `w-full text-sm border ${
      error ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-amber-200"
    } rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2`;

    switch (field.type) {
      case "textarea": {
        const isEnonceField = ["ennonce", "enonce", "contenu"].includes(field.name);
        return (
          <div className="space-y-1.5">
            {isEnonceField && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-gray-400">
                  Saisie directe ou extraction depuis un sujet PDF
                </span>
                <label
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                    extractingField === field.name
                      ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse cursor-wait"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  {extractingField === field.name ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <FileText size={13} />
                  )}
                  <span>
                    {extractingField === field.name
                      ? "Extraction du PDF en cours..."
                      : "Importer depuis un PDF"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={extractingField === field.name}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfExtract(field.name, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
            <textarea
              value={(values[field.name] as string) ?? ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={isEnonceField ? 6 : 4}
              className={baseInputClass}
            />
          </div>
        );
      }

      case "number":
        return (
          <input
            type="number"
            value={(values[field.name] as number) ?? ""}
            onChange={(e) => setValue(field.name, e.target.value ? Number(e.target.value) : "")}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!values[field.name]}
              onChange={(e) => setValue(field.name, e.target.checked)}
              className="accent-amber-500 w-4 h-4"
            />
            {field.helperText ?? "Actif"}
          </label>
        );

      case "select":
        return (
          <select
            value={(values[field.name] as string) ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Sélectionner...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "select-async": {
        const options = asyncOptions[field.name] ?? [];
        return (
          <select
            value={(values[field.name] as string) ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            disabled={loadingOptions}
            className={baseInputClass}
          >
            <option value="">
              {loadingOptions ? "Chargement..." : "Sélectionner..."}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case "text":
      default:
        return (
          <input
            type={field.name === "password" ? "password" : field.name === "email" ? "email" : "text"}
            value={(values[field.name] as string) ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <h2 className="text-lg font-bold text-gray-900">
        {isEditMode ? `Modifier : ${schema.title}` : `Ajouter : ${schema.title}`}
      </h2>

      {globalError && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {globalError}
        </div>
      )}

      {schema.fields.map((field) => (
        <div key={field.name}>
          {field.type !== "checkbox" && (
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              {field.label}
              {field.required && <span className="text-red-400"> *</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
          )}
          {field.helperText && field.type !== "checkbox" && (
            <p className="text-xs text-gray-400 mt-1">{field.helperText}</p>
          )}
        </div>
      ))}

      <div className="flex gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 cursor-pointer"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading || extractingField !== null}
          className="flex-1 text-sm font-medium bg-amber-500 rounded-lg px-4 py-2 text-white hover:bg-amber-600 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
