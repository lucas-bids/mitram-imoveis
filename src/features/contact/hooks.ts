import { useState } from "react";
import { NetlifyFormName, submitToNetlifyForms } from "@/features/contact/netlify";

export function useContactFormSubmit(formName: NetlifyFormName) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await submitToNetlifyForms(formName, formData);
      setSuccess(true);
      form.reset();
    } catch {
      setError("Falha de conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, error, handleSubmit, setSuccess };
}

export function useAutoResizeTextarea() {
  const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  return handleResize;
}
