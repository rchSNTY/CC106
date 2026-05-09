import { useCallback, useState } from 'react';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export function useFormValidation<T extends Record<string, any>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(<K extends keyof T>(field: K, value: T[K], rules: ValidationRule<T[K]>[]) => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  }, []);

  const validateAll = useCallback((data: T, validationRules: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in validationRules) {
      const rules = validationRules[field];
      if (rules) {
        const value = data[field];
        for (const rule of rules) {
          if (!rule.validate(value)) {
            newErrors[field] = rule.message;
            isValid = false;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, []);

  const setFieldTouched = useCallback(<K extends keyof T>(field: K) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback(<K extends keyof T>(field: K) => {
    return touched[field] ? errors[field] : undefined;
  }, [errors, touched]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    setFieldTouched,
    getFieldError,
    clearErrors,
  };
}
