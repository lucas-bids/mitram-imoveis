import { useState } from "react";
import { submitContactForm } from "@/features/contact/actions";

export function useContactFormSubmit(type: string) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("type", type);

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error || "Ocorreu um erro ao enviar.");
      }
    } catch (err) {
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
