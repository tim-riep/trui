// Copyright 2026 The TRUI Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useEffect, useRef, useState } from 'react';

export interface ParsedTextOptions {
  /** The current value, or null or `""` when empty. */
  value: string | null;
  /** Reports a new value. */
  report: (value: string | null) => void;
  /** The value of an empty field: null or `""`. */
  empty: string | null;
  /** Text shown for a value. */
  format: (value: string) => string;
  /** Value for a text, or the message why the text is not valid. */
  parse: (text: string) => { value: string } | { error: string };
  /** Message if a valid value is out of range, or null. */
  rangeError?: (value: string) => string | null;
}

/**
 * Text input for values with a canonical form (dates, times): valid text is
 * reported while typing; invalid text keeps the last value and shows an error
 * once the user leaves the field or presses Enter. When the field is not
 * being edited, it shows the formatted value.
 */
export function useParsedText({
  value,
  report,
  empty,
  format,
  parse,
  rangeError,
}: ParsedTextOptions) {
  const [editText, setEditText] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const lastReported = useRef(value);

  useEffect(() => {
    if (editText !== null && value !== lastReported.current) {
      setEditText(null);
      setInvalid(null);
      setShowInvalid(false);
    }
    lastReported.current = value;
  }, [value, editText]);

  const send = (next: string | null) => {
    lastReported.current = next;
    report(next);
  };

  const onTextChange = (text: string) => {
    setEditText(text);
    setShowInvalid(false);
    if (text.trim() === '') {
      setInvalid(null);
      send(empty);
      return;
    }
    const parsed = parse(text);
    if ('error' in parsed) {
      setInvalid(parsed.error);
    } else {
      setInvalid(null);
      if (parsed.value !== value) send(parsed.value);
    }
  };

  /** Ends editing: shows the formatted value, or the error for invalid text. */
  const commit = () => {
    if (invalid) setShowInvalid(true);
    else setEditText(null);
  };

  /** Sets a value picked elsewhere (calendar, list) and ends editing. */
  const pick = (next: string) => {
    setEditText(null);
    setInvalid(null);
    setShowInvalid(false);
    send(next);
  };

  const reset = () => {
    setEditText(null);
    setInvalid(null);
    setShowInvalid(false);
  };

  const error =
    showInvalid && invalid !== null ? invalid : value ? (rangeError?.(value) ?? null) : null;
  return {
    text: editText ?? (value ? format(value) : ''),
    onTextChange,
    commit,
    pick,
    reset,
    /** An error to show, or null. */
    error,
    /** Why the text cannot be read, also before it is shown; for form validation. */
    invalid,
  };
}
