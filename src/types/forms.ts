export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "select-async"
  | "checkbox";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  loadOptions?: () => Promise<SelectOption[]>;
  helperText?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
}

export interface ResourceSchema {
  key: string;
  title: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  list: () => Promise<unknown[]>;
  create: (values: Record<string, unknown>) => Promise<unknown>;
  update: (id: string | number, values: Record<string, unknown>) => Promise<unknown>;
  remove: (id: string | number) => Promise<void>;
  toFormValues?: (item: Record<string, unknown>) => Record<string, unknown>;
}