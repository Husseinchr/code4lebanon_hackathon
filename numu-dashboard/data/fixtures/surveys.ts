import type { Survey } from "@/lib/types";

export const surveysFixture: Survey[] = [
  {
    id: "2a76fd3f-3082-44d9-a09f-9f3aa4de1111",
    slug: "mitai-numu-survey",
    title: "MITAI x NUMU Learner Survey",
    status: "active",
    created_at: "2026-02-01T10:00:00.000Z",
    updated_at: "2026-02-22T09:00:00.000Z",
    schema: {
      sections: [
        {
          id: "identity",
          title: "Learner Identity",
          fields: [
            { key: "full_name", type: "text", label: "Full Name", required: true },
            { key: "email", type: "email", label: "Email", required: true },
            { key: "phone", type: "text", label: "Phone", required: true },
          ],
        },
        {
          id: "strategy",
          title: "Learning Strategy",
          fields: [
            { key: "training_track", type: "select", label: "Track", required: true },
            { key: "learning_reason", type: "multi_select", label: "Motivations", required: true },
            { key: "ai_goals", type: "multi_select", label: "AI Goals", required: true },
          ],
        },
      ],
    },
  },
];
