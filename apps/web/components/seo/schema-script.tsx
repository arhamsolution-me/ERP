import Script from "next/script";

interface SchemaScriptProps {
  schema: Record<string, any>;
}

export function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <Script
      id="schema-script"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
